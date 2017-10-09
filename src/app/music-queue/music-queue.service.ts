import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import 'rxjs/add/operator/map'

import groupBy from '../lib/group-by'
import { Track } from '../track'
import { Source } from '../source'
import { ServerSocket } from '../server-socket.service'

type TracksById = Map<string, Track[]>

export interface TrackWithIndex {
  track: Track
  index: number
}

export interface Change {
  insertIdx?: number,
  track?: Track,
  removeIdx?: number,
  moveFrom?: number,
  to?: number,
}

export interface TracksWithChange {
  tracks: Track[],
  change: Change,
}

export interface Move {
  tracksWithIndexes: TrackWithIndex[],
  offset: number,
}

@Injectable()
export class MusicQueue extends Source {
  tracksWithChanges: Observable<TracksWithChange> = this.getTracksWithChanges()

  tracks: Observable<Track[]> = this.tracksWithChanges
    .map(({ tracks }: { tracks: Track[] }) => tracks)
    .distinctUntilChanged()
    .shareReplay(1)

  changes: Observable<Change> = this
    .tracksWithChanges.map(({ change }) => change)
    .filter(val => !!val)
    .shareReplay(1)

  private scrolls$ = new Subject<number>()
  scrolls = this.scrolls$.asObservable()

  private appendTrack$ = new Subject<Track>()

  private moveTracks$ = new Subject<Move>()

  tracksById = this.tracks.map(
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

  insertTrack(track: Track, index: number): void {
    this.socket.send({ type: 'insertTrack', payload: { track, index } })
  }

  appendTrack(track: Track): void {
    this.appendTrack$.next(track)
  }

  removeTrack(track: Track, index: number): void {
    this.socket.send({ type: 'removeTrack', payload: { trackId: track.id, index } })
  }

  scrollToTrack(trackIdx: number): void {
    this.scrolls$.next(trackIdx)
  }

  moveTracks(tracksWithIndexes: TrackWithIndex[], offset: number): void {
    this.moveTracks$.next({ tracksWithIndexes, offset })
  }

  private getTracksWithChanges(): Observable<TracksWithChange> {
    return this.hot(
      this.socket.messages
      .scan(
        ({ tracks }: { tracks: Track[] }, message) => {
          switch (message.type) {
            case 'musicQueue':
              return {
                tracks: message.payload,
                change: null,
              }
            case 'insert': {
              const {track, index: insertIdx} = message.payload
              return {
                change: { insertIdx, track },
                tracks: [
                  ...tracks.slice(0, insertIdx),
                  track,
                  ...tracks.slice(insertIdx),
                ],
              }
            }
            case 'remove': {
              const removeIdx = message.payload
              return {
                change: { removeIdx },
                tracks: [
                  ...tracks.slice(0, removeIdx),
                  ...tracks.slice(removeIdx + 1),
                ],
              }
            }
            case 'move': {
              const { index, offset } = message.payload
              const newIndex = index + offset
              if (newIndex >= 0 && newIndex < tracks.length) {
                const change = { moveFrom: index, to: newIndex }

                if (offset > 0) {
                  return {
                    change,
                    tracks: [
                      ...tracks.slice(0, index),
                      ...tracks.slice(index + 1, newIndex + 1),
                      tracks[index],
                      ...tracks.slice(newIndex + 1)
                    ]
                  }
                } else {
                  return {
                    change,
                    tracks: [
                      ...tracks.slice(0, newIndex),
                      tracks[index],
                      ...tracks.slice(newIndex, index),
                      ...tracks.slice(index + 1),
                    ]
                  }
                }
              }
            }
          }
          return { tracks, change: null }
        },
        { tracks: [] },
      )
      .startWith({ tracks: [], change: null })
      .shareReplay(1)
    )
  }
}
