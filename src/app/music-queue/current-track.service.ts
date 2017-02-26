import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { OnDestroy } from '../on-destroy'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'

@Injectable()
export class CurrentTrack extends OnDestroy {
  // TODO: remove these
  public index = -1

  // stream that relays the above two pieces of information along with the elapsed time
  public indexStream = new BehaviorSubject<number>(-1)
  public elapsedStream = new BehaviorSubject<number>(0)
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
        // TODO: remove {
        this.index = trackIdx
        // TODO: }
        this.indexStream.next(trackIdx)
        this.paused.next(paused)
        this.elapsedStream.next(elapsed)
        return
      }
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
