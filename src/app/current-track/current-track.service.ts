import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/debounce'

import { OnDestroy } from '../on-destroy'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'

export interface CurrentTrackStatus {
  trackIdx: number
  elapsed: number
  paused: boolean
}

@Injectable()
export class CurrentTrack extends OnDestroy {
  // stream that relays the above two pieces of information along with the elapsed time
  public index = new BehaviorSubject<number>(-1)
  public elapsed = new BehaviorSubject<number>(0)
  public paused = new BehaviorSubject<boolean>(true)

  // public track?: Track = null

  constructor(private socket: ServerSocket) {
    super()
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getCurrentTrackStatus' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      if (message.type === 'currentTrack') {
        const { index: trackIdx, elapsed, paused } = message.payload
        this.index.next(trackIdx)
        this.paused.next(paused)
        this.elapsed.next(elapsed)
        return
      }
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }

  // merge all the streams
  get status(): Observable<CurrentTrackStatus> {
    return Observable.combineLatest(
      this.index,
      this.elapsed,
      this.paused,
      (trackIdx, elapsed, paused) => ({ trackIdx, elapsed, paused })
    ).debounce(() => Observable.timer(10))
  }

  pause() {
    this.socket.send({ type: 'pauseTrack', payload: false })
  }

  unpause() {
    this.socket.send({ type: 'pauseTrack', payload: true })
  }
}
