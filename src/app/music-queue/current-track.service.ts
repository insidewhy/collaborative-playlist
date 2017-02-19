import { Injectable } from '@angular/core'

import { OnDestroy } from '../on-destroy'
import { Track } from '../track'
import { ServerSocket } from '../server-socket.service'

@Injectable()
export class CurrentTrack extends OnDestroy {
  // the index within the tracklist of the playing track
  public index = -1
  // public track?: Track = null

  constructor(private socket: ServerSocket) {
    super()
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getCurrentTrackStatus' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      const {currentTrack} = message
      if (currentTrack !== undefined) {
        this.index = currentTrack
        return
      }

      const {insert: insertIdx} = message
      if (insertIdx !== undefined) {
        if (insertIdx <= this.index)
          ++this.index
        return
      }

      const {remove: removeIdx} = message
      if (removeIdx !== undefined) {
        if (removeIdx === this.index) {
          // TODO: skip to next song?
        }
        else if (removeIdx < this.index) {
          --this.index
        }
        return
      }
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }

  public playTrack(track: Track, position: number):void {
    this.socket.send({ type: 'playTrack', payload: { trackId: track.id, position } })
  }
}
