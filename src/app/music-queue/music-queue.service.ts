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

        this.changeStream.next({ insertIdx })
        return
      }

      const {remove: removeIdx} = message
      if (removeIdx !== undefined) {
        // ensure it happens on the next tick so other subscribers can
        // handle the event before the track is spliced
        this.tracks.splice(removeIdx, 1)
        this.changeStream.next({ removeIdx })
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

  public removeTrack(track: Track, position: number):void {
    this.socket.send({ type: 'removeTrack', payload: { trackId: track.id, position } })
  }

  public playTrack(track: Track, position: number):void {
    this.socket.send({ type: 'playTrack', payload: { trackId: track.id, position } })
  }

  public skipTrack(offset: number):void {
    const nextIdx = this.currentTrack.index + offset
    const track = this.tracks[nextIdx]
    if (track)
      this.playTrack(track, nextIdx)
  }
}
