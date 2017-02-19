import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import groupBy from '../lib/group-by'
import { Track } from '../track'
import { OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'

@Injectable()
export class MusicQueue extends OnDestroy {
  public tracks: Track[]
  public tracksById: Map<string, Track[]> = new Map()

  constructor(private socket: ServerSocket) {
    super()
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      // console.debug('got message', message)
      const {musicQueue} = message

      if (musicQueue) {
        this.tracks = musicQueue
        this.tracksById = groupBy(this.tracks, track => track.id)
        return
      }

      const {insert: insertIdx} = message
      if (insertIdx !== undefined) {
        const {track} = message
        this.tracks.splice(insertIdx, 0, track)
        const existing = this.tracksById.get(track.id)
        if (existing)
          existing.push(track)
        else
          this.tracksById.set(track.id, [ track ])
        return
      }

      const {remove: removeIdx} = message
      if (removeIdx !== undefined) {
        this.tracks.splice(removeIdx, 1)
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
