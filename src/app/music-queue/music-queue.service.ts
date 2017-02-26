import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import groupBy from '../lib/group-by'
import { Track } from '../track'
import { OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'
import { CurrentTrack } from './current-track.service'

type TracksById = Map<string, Track[]>

@Injectable()
export class MusicQueue extends OnDestroy {
  public tracks = new BehaviorSubject<Track[]>([])
  public tracksById = new BehaviorSubject<TracksById>(new Map<string, Track[]>())
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
        this.tracks.next(message.payload)
        this.emitTracksById()
        return
      }

      if (message.type === 'insert') {
        const {track, index: insertIdx} = message.payload

        // send before modifications to queue/currentTrack below
        this.changeStream.next({ insertIdx, track })

        const currentTracks = this.tracks.getValue()
        this.tracks.next([
          ...currentTracks.slice(0, insertIdx),
          track,
          ...currentTracks.slice(insertIdx)
        ])
        this.emitTracksById()

        const currentIndex = this.currentTrack.index.getValue()
        if (insertIdx <= currentIndex)
          this.currentTrack.index.next(currentIndex + 1)

        return
      }

      if (message.type === 'remove') {
        const removeIdx = message.payload
        // send before modifications to queue/track below
        this.changeStream.next({ removeIdx })

        const currentTracks = this.tracks.getValue()
        this.tracks.next([
          ...currentTracks.slice(0, removeIdx),
          ...currentTracks.slice(removeIdx + 1)
        ])
        this.emitTracksById()

        const currentIndex = this.currentTrack.index.getValue()
        if (removeIdx < currentIndex)
          this.currentTrack.index.next(currentIndex - 1)
        return
      }
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }

  private emitTracksById() {
    this.tracksById.next(groupBy(this.tracks.getValue(), track => track.id))
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
    const nextIdx = this.currentTrack.index.getValue() + offset
    const track = this.tracks.getValue()[nextIdx]
    if (track)
      this.playTrack(track.id, nextIdx)
  }
}
