import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'

import groupBy from '../lib/group-by'
import { Track } from '../track'
import { OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'
import { CurrentTrack } from './current-track.service'

@Injectable()
export class MusicQueue extends OnDestroy {
  public tracks: Track[]
  public tracksById: Map<string, Track[]> = new Map()
  public changeStream = new Subject<any>()

  constructor(private socket: ServerSocket, private currentTrack: CurrentTrack) {
    super()
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      console.debug('got message', message)

      if (message.type === 'musicQueue') {
        this.tracks = message.payload
        this.tracksById = groupBy(this.tracks, track => track.id)
        return
      }

      if (message.type === 'insert') {
        const {track, index: insertIdx} = message.payload

        // send before modifications to queue/currentTrack below
        this.changeStream.next({ insertIdx, track })

        this.tracks.splice(insertIdx, 0, track)
        const existing = this.tracksById.get(track.id)
        if (existing)
          existing.push(track)
        else
          this.tracksById.set(track.id, [ track ])

        if (insertIdx <= this.currentTrack.index)
          ++this.currentTrack.index

        return
      }

      if (message.type === 'remove') {
        const removeIdx = message.payload
        // send before modifications to queue/track below
        this.changeStream.next({ removeIdx })

        this.tracks.splice(removeIdx, 1)

        if (removeIdx < this.currentTrack.index)
          --this.currentTrack.index
        return
      }
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }

  public insertTrack(track: Track, index: number):void {
    this.socket.send({ type: 'insertTrack', payload: { track, index } })
  }

  public removeTrack(track: Track, index: number):void {
    this.socket.send({ type: 'removeTrack', payload: { trackId: track.id, index } })
  }

  public playTrack(trackId: string, index: number):void {
    this.socket.send({ type: 'playTrack', payload: { trackId, index } })
  }

  public skipTrack(offset: number):void {
    const nextIdx = this.currentTrack.index + offset
    const track = this.tracks[nextIdx]
    if (track)
      this.playTrack(track.id, nextIdx)
  }
}
