import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
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
  public tracks = new ReplaySubject<Track[]>(1)
  public changeStream = new Subject<any>()
  private scrollsSubject = new Subject<number>()
  public scrolls = this.scrollsSubject.asObservable()
  private appendTrackSubject = new Subject<Track>()
  private moveTracksSubject = new Subject<{
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
      this.socket.messages.withLatestFrom(this.tracks.startWith([])),
      (([ message, tracks ]) => {
        // console.debug('recv', message)

        if (message.type === 'musicQueue') {
          this.tracks.next(message.payload)
        } else if (message.type === 'insert') {
          const {track, index: insertIdx} = message.payload
          this.changeStream.next({ insertIdx, track })

          this.tracks.next([
            ...tracks.slice(0, insertIdx),
            track,
            ...tracks.slice(insertIdx)
          ])
        } else if (message.type === 'remove') {
          const removeIdx = message.payload
          this.changeStream.next({ removeIdx })

          this.tracks.next([
            ...tracks.slice(0, removeIdx),
            ...tracks.slice(removeIdx + 1)
          ])
        } else if (message.type === 'move') {
          const { index, offset } = message.payload
          const newIndex = index + offset
          if (newIndex >= 0 && newIndex < tracks.length) {
            tracks.splice(newIndex, 0, ...tracks.splice(index, 1))
            this.tracks.next(tracks)
            this.changeStream.next({ moveFrom: index, to: newIndex })
          }
        }
      })
    )

    this.reactTo(
      this.appendTrackSubject.withLatestFrom(this.tracks.map(tracks => tracks.length)),
      ([track, length]) => { this.insertTrack(track, length) }
    )

    this.reactTo(
      this.moveTracksSubject.withLatestFrom(this.tracks),
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
    this.appendTrackSubject.next(track)
  }

  public removeTrack(track: Track, index: number): void {
    this.socket.send({ type: 'removeTrack', payload: { trackId: track.id, index } })
  }

  public scrollToTrack(trackIdx: number): void {
    this.scrollsSubject.next(trackIdx)
  }

  public moveTracks(tracksWithIndexes: TrackWithIndex[], offset: number): void {
    this.moveTracksSubject.next({ tracksWithIndexes, offset })
  }
}
