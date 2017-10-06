import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/timer'
import 'rxjs/add/observable/interval'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/debounce'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/scan'

import { Source } from '../source'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'
import { MusicQueue } from '../music-queue/music-queue.service'

export interface CurrentTrackStatus {
  trackIdx: number
  elapsed: number
  paused: boolean
}

// Emit the number of milliseconds each second from startTime
const countSecondsFrom = startTime =>
  Observable.interval(1000)
    .map(val => startTime + (val + 1) * 1000)
    .startWith(startTime)

@Injectable()
export class CurrentTrack extends Source {
  private skips = new ReplaySubject<number>(1)

  public index: Observable<number> = this.hot(
    this.socket.messages
      .filter(({ type }) => type === 'currentTrack' || type === 'remove' || type === 'insert')
      .scan((index, message) => {
        switch (message.type) {
          case 'currentTrack':
            return message.payload.index
          case 'insert':
            return message.payload.index <= index ? index + 1 : index
          case 'remove':
            return message.payload < index ? index - 1 : index
        }
      }, -1)
  )

  public paused: Observable<boolean> = this.hot(
    this.socket.messages
    .filter(message => message.type === 'currentTrack')
    .map(({ payload: { paused } }) => paused)
  )

  public elapsed: Observable<number> = this.hot(
    this.socket.messages
    .withLatestFrom(this.index)
    .filter(([ message, index ]) =>
      message.type === 'currentTrack' ||
      message.type === 'remove' && message.payload === index
    )
    .switchMap(([ message, index ]) => {
      // TODO: if the final track was removed then interval isn't needed
      if (message.type === 'remove')
        return countSecondsFrom(0)

      const { index: trackIdx, elapsed, paused } = message.payload
      return paused || trackIdx === -1 ? Observable.of(elapsed) : countSecondsFrom(elapsed)
    })
    .startWith(0)
  )

  // merge all the streams
  public status: Observable<CurrentTrackStatus> = Observable.combineLatest(
    this.index,
    this.elapsed,
    this.paused,
    (trackIdx, elapsed, paused) => ({ trackIdx, elapsed, paused })
  ).debounce(() => Observable.timer(10))

  public track: Observable<Track | null> = Observable.combineLatest(
    this.index,
    this.musicQueue.tracks,
  )
  .map(([index, tracks]) => tracks[index])
  .distinctUntilChanged()
  .share()

  constructor(private socket: ServerSocket, private musicQueue: MusicQueue) {
    super()

    this.reactTo(this.socket.connectionStatus, nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getCurrentTrackStatus' })
    })

    this.reactTo(this.skips.withLatestFrom(this.index, musicQueue.tracks), ([offset, index, tracks]) => {
      const nextIdx = index + offset
      const track = tracks[nextIdx]
      if (track)
        this.play(track.id, nextIdx)
    })
  }

  pause() {
    this.socket.send({ type: 'pauseTrack', payload: false })
  }

  unpause() {
    this.socket.send({ type: 'pauseTrack', payload: true })
  }

  skip(offset: number): void {
    this.skips.next(offset)
  }

  play(trackId: string, index: number): void {
    this.socket.send({ type: 'playTrack', payload: { trackId, index } })
  }
}
