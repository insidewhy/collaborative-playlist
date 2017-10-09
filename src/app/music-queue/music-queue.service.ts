import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import groupBy from '../lib/group-by'
import { Track } from '../track'
import { Source } from '../source'
import { ServerSocket } from '../server-socket.service'

type TracksById = Map<string, Track[]>

export interface TrackWithIndex {
  track: Track
  index: number
}

@Injectable()
export class MusicQueue extends Source {
  public tracks = this.socket.messages
  .scan(
    (tracks, message) => {
      switch (message.type) {
        case 'musicQueue':
          return message.payload
        case 'insert': {
          const {track, index: insertIdx} = message.payload
          this.changeStream.next({ insertIdx, track })
          return [
            ...tracks.slice(0, insertIdx),
            track,
            ...tracks.slice(insertIdx),
          ]
        }
        case 'remove': {
          const removeIdx = message.payload
          this.changeStream.next({ removeIdx })
          return [
            ...tracks.slice(0, removeIdx),
            ...tracks.slice(removeIdx + 1),
          ]
        }
        case 'move': {
          const { index, offset } = message.payload
          const newIndex = index + offset
          if (newIndex >= 0 && newIndex < tracks.length) {
            setTimeout(() => {
              this.changeStream.next({ moveFrom: index, to: newIndex })
            })

            if (offset > 0) {
              return [
                ...tracks.slice(0, index),
                ...tracks.slice(index + 1, newIndex + 1),
                tracks[index],
                ...tracks.slice(newIndex + 1)
              ]
            } else {
              return [
                ...tracks.slice(0, newIndex),
                tracks[index],
                ...tracks.slice(newIndex, index),
                ...tracks.slice(index + 1),
              ]
            }
          }
        }
        default:
          return tracks
      }
    },
    []
  )
  .startWith([])
  .distinctUntilChanged()
  .shareReplay(1)

  // TODO: make reactive
  public changeStream = new Subject<any>()

  private scrolls$ = new Subject<number>()
  public scrolls = this.scrolls$.asObservable()

  private appendTrack$ = new Subject<Track>()

  private moveTracks$ = new Subject<{
    tracksWithIndexes: TrackWithIndex[],
    offset: number,
  }>()

  public tracksById = this.tracks.map(
    tracks => groupBy(tracks, track => track.id)
  ).shareReplay(1)

  constructor(private socket: ServerSocket) {
    super()

    this.reactTo(
      this.socket.connectionStatus,
      nConnected => {
        if (nConnected)
          this.socket.send({ type: 'getMusicQueue' })
      }
    )

    this.reactTo(
      this.appendTrack$.withLatestFrom(this.tracks.map(tracks => tracks.length)),
      ([track, length]) => { this.insertTrack(track, length) }
    )

    this.reactTo(
      this.moveTracks$.withLatestFrom(this.tracks),
      ([ { tracksWithIndexes, offset }, tracks ]) => {
        let start, end, limit

        // if moving up start at the top, else the bottom
        if (offset < 0) {
          limit = start = 0
          end = tracksWithIndexes.length
        } else {
          limit = tracks.length - 1
          start = tracksWithIndexes.length - 1
          end = -1
        }

        for (let i = start; i !== end; i -= offset, limit -= offset) {
          const { index, track } = tracksWithIndexes[i]
          if (index !== limit)
            this.socket.send({ type: 'moveTrack', payload: { index, trackId: track.id, offset } })
        }
      }
    )
  }

  public insertTrack(track: Track, index: number): void {
    this.socket.send({ type: 'insertTrack', payload: { track, index } })
  }

  public appendTrack(track: Track): void {
    this.appendTrack$.next(track)
  }

  public removeTrack(track: Track, index: number): void {
    this.socket.send({ type: 'removeTrack', payload: { trackId: track.id, index } })
  }

  public scrollToTrack(trackIdx: number): void {
    this.scrolls$.next(trackIdx)
  }

  public moveTracks(tracksWithIndexes: TrackWithIndex[], offset: number): void {
    this.moveTracks$.next({ tracksWithIndexes, offset })
  }
}
