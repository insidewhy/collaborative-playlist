import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { Track } from '../track'
import { OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'

@Injectable()
export class MusicQueue extends OnDestroy {
  public tracks: Track[]

  constructor(private socket: ServerSocket) {
    super()
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      const {musicQueue} = message
      if (musicQueue) {
        this.tracks = musicQueue
        console.debug('set tracks', this.tracks)
        return
      }
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }

  public insertTrack(track: Track, position: number):void {
    this.socket.send({ type: 'insertTrack', payload: { track, position } })
  }
}
