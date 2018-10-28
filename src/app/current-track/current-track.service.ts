
import {
  timer as observableTimer,
  combineLatest as observableCombineLatest,
  of as observableOf,
  interval as observableInterval,
  ReplaySubject ,
  Observable
} from 'rxjs'

import {map, debounce, switchMap, startWith, withLatestFrom, scan, share, distinctUntilChanged, filter} from 'rxjs/operators'
import { Injectable } from '@angular/core'









import { Source } from '../source'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { SelectedTracks } from '../music-queue/selected-tracks.service'

export interface CurrentTrackStatus {
  trackIdx: number
  elapsed: number
  paused: boolean
}

// Emit the number of milliseconds each second from startTime
const countSecondsFrom = startTime =>
  observableInterval(1000).pipe(
    map(val => startTime + (val + 1) * 1000),
    startWith(startTime), )

@Injectable()
export class CurrentTrack extends Source {
  private skip$ = new ReplaySubject<number>(1)
  private goToCurrent$ = new ReplaySubject<void>(1)

  index: Observable<number> = this.hot(
    this.socket.messages.pipe(
      filter(({ type }) => type === 'currentTrack' || type === 'remove' || type === 'insert'),
      scan((index, message: any) => {
        const { payload } = message
        switch (message.type) {
          case 'currentTrack':
            return payload.index
          case 'insert':
            return payload.index <= index ? index + 1 : index
          case 'remove':
            return payload < index ? index - 1 : index
        }
      }, -1), )
  )

  paused: Observable<boolean> = this.hot(
    this.socket.messages.pipe(
    filter(message => message.type === 'currentTrack'),
    map(({ payload: { paused } }) => paused), )
  )

  elapsed: Observable<number> = this.hot(
    this.socket.messages.pipe(
    withLatestFrom(this.index),
    filter(([ message, index ]) =>
      message.type === 'currentTrack' ||
      message.type === 'remove' && message.payload === index
    ),
    switchMap(([ message, index ]) => {
      // TODO: if the final track was removed then interval isn't needed
      if (message.type === 'remove')
        return countSecondsFrom(0)

      const { index: trackIdx, elapsed, paused } = message.payload
      return paused || trackIdx === -1 ? observableOf(elapsed) : countSecondsFrom(elapsed)
    }),
    startWith(0), )
  )

  // merge all the streams
  status: Observable<CurrentTrackStatus> = observableCombineLatest(
    this.index,
    this.elapsed,
    this.paused,
    (trackIdx, elapsed, paused) => ({ trackIdx, elapsed, paused })
  ).pipe(debounce(() => observableTimer(10)))

  track: Observable<Track | null> =
    observableCombineLatest(this.index, this.musicQueue.tracks).pipe(
    map(([index, tracks]) => tracks[index]),
    distinctUntilChanged(),
    share(), )

  constructor(
    private socket: ServerSocket,
    private musicQueue: MusicQueue,
    selectedTracks: SelectedTracks,
  ) {
    super()

    this.reactTo(this.socket.connectionStatus, nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getCurrentTrackStatus' })
    })

    this.reactTo(this.skip$.pipe(withLatestFrom(this.index, musicQueue.tracks)), ([offset, index, tracks]) => {
      const nextIdx = index + offset
      const track = tracks[nextIdx]
      if (track)
        this.play(track.id, nextIdx)
    })

    this.reactTo(
      this.goToCurrent$.pipe(withLatestFrom(this.index, selectedTracks.indexes)),
      ([, index, selected]) => {
        if (selected.size) {
          const selIndexes = Array.from(selected).sort()
          console.log('TODO: move after', index, selIndexes)
          // TODO: move selected tracks after index
        } else {
          this.musicQueue.scrollToTrack(index)
        }
      }
    )
  }

  pause() {
    this.socket.send({ type: 'pauseTrack', payload: false })
  }

  unpause() {
    this.socket.send({ type: 'pauseTrack', payload: true })
  }

  play(trackId: string, index: number): void {
    this.socket.send({ type: 'playTrack', payload: { trackId, index } })
  }

  skip(offset: number): void {
    this.skip$.next(offset)
  }

  goToCurrent() {
    this.goToCurrent$.next(undefined)
  }
}
