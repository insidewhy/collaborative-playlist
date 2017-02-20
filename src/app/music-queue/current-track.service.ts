import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { OnDestroy } from '../on-destroy'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'

interface TrackStatus {
  trackIdx: number
  elapsed: number
}

@Injectable()
export class CurrentTrack extends OnDestroy {
  // the index within the tracklist of the playing track
  public index = -1
  // public track?: Track = null

  public stream = new ReplaySubject<TrackStatus>(1)

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
        const {elapsed, index: trackIdx} = message.payload
        this.index = trackIdx
        this.stream.next({ trackIdx, elapsed })
        return
      }
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }
}
