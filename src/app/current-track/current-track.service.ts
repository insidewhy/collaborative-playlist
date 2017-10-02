import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/timer'
import 'rxjs/add/observable/interval'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/debounce'
import 'rxjs/add/operator/shareReplay'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/withLatestFrom'

import { DestructionCallbacks } from '../destruction-callbacks'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'

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
export class CurrentTrack extends DestructionCallbacks {
  // TODO: implement reactively
  public index = new BehaviorSubject<number>(-1)

  public paused = this.socket.messages
    .filter(message => message.type === 'currentTrack')
    .map(({ payload: { paused } }) => paused)
    .shareReplay(1)

  public elapsed: Observable<number> = this.socket.messages
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
    .shareReplay(1)

  // merge all the streams
  public status: Observable<CurrentTrackStatus> = Observable.combineLatest(
    this.index,
    this.elapsed,
    this.paused,
    (trackIdx, elapsed, paused) => ({ trackIdx, elapsed, paused })
  ).debounce(() => Observable.timer(10))

  // public track?: Track = null

  constructor(private socket: ServerSocket) {
    super()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getCurrentTrackStatus' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      if (message.type === 'currentTrack')
        this.index.next(message.payload.index)
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }

  pause() {
    this.socket.send({ type: 'pauseTrack', payload: false })
  }

  unpause() {
    this.socket.send({ type: 'pauseTrack', payload: true })
  }
}
