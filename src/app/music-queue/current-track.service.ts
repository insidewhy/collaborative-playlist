import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { OnDestroy } from '../on-destroy'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'

interface TrackStatus {
  trackIdx: number
  elapsed: number
  paused: boolean
}

@Injectable()
export class CurrentTrack extends OnDestroy {
  // the index within the tracklist of the playing track
  public index = -1
  public paused = false
  // stream that relays the above two pieces of information along with the elapsed time
  public stream = new ReplaySubject<TrackStatus>(1)

  // public track?: Track = null

  // TODO: provide stream to subscribe to current track
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
        this.paused = paused
        this.index = trackIdx
        this.stream.next({ trackIdx, elapsed, paused })
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
