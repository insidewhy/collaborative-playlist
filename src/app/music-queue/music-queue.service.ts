import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import groupBy from '../lib/group-by'
import { Track } from '../track'
import { DestructionCallbacks } from '../destruction-callbacks'
import { ServerSocket } from '../server-socket.service'
import { CurrentTrack } from '../current-track/current-track.service'

type TracksById = Map<string, Track[]>

export interface TrackWithIndex {
  track: Track
  index: number
}

@Injectable()
export class MusicQueue extends DestructionCallbacks {
  public tracks = new BehaviorSubject<Track[]>([])
  public tracksById = new BehaviorSubject<TracksById>(new Map<string, Track[]>())
  public changeStream = new Subject<any>()
  private scrollsSubject = new Subject<number>()
  public scrolls = this.scrollsSubject.asObservable()

  constructor(private socket: ServerSocket, private currentTrack: CurrentTrack) {
    super()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      // console.debug('recv', message)

      if (message.type === 'musicQueue') {
        this.tracks.next(message.payload)
        this.emitTracksById()
      } else if (message.type === 'insert') {
        const {track, index: insertIdx} = message.payload
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
      } else if (message.type === 'remove') {
        const removeIdx = message.payload
        this.changeStream.next({ removeIdx })

        const currentTracks = this.tracks.getValue()
        this.tracks.next([
          ...currentTracks.slice(0, removeIdx),
          ...currentTracks.slice(removeIdx + 1)
        ])
        this.emitTracksById()

        const currentIndex = this.currentTrack.index.getValue()
        if (removeIdx < currentIndex) {
          this.currentTrack.index.next(currentIndex - 1)
        } else if (removeIdx === currentIndex) {
          const nextTrack = this.tracks.getValue()[removeIdx + 1]
          if (nextTrack)
            this.currentTrack.index.next(removeIdx)
        }
      } else if (message.type === 'move') {
        const currentTracks = this.tracks.getValue()
        const { index, offset } = message.payload
        const newIndex = index + offset
        if (newIndex >= 0 && newIndex < currentTracks.length) {
          this.changeStream.next({ moveFrom: index, to: newIndex })
          currentTracks.splice(newIndex, 0, ...currentTracks.splice(index, 1))
        }
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

  public insertTrack(track: Track, index: number): void {
    this.socket.send({ type: 'insertTrack', payload: { track, index } })
  }

  public removeTrack(track: Track, index: number): void {
    this.socket.send({ type: 'removeTrack', payload: { trackId: track.id, index } })
  }

  public playTrack(trackId: string, index: number): void {
    this.socket.send({ type: 'playTrack', payload: { trackId, index } })
  }

  public scrollToTrack(trackIdx: number): void {
    this.scrollsSubject.next(trackIdx)
  }

  public skipTrack(offset: number): void {
    const nextIdx = this.currentTrack.index.getValue() + offset
    const track = this.tracks.getValue()[nextIdx]
    if (track)
      this.playTrack(track.id, nextIdx)
  }

  public moveTracks(tracksWithIndexes: TrackWithIndex[], offset: number): void {
    // the limit is used to prevent items being moved passed the top or a previous selection
    let start, end, limit

    // if moving up start at the top, else the bottom
    if (offset < 0) {
      limit = start = 0
      end = tracksWithIndexes.length
    } else {
      limit = this.tracks.getValue().length - 1
      start = tracksWithIndexes.length - 1
      end = -1
    }

    for (let i = start; i !== end; i -= offset, limit -= offset) {
      const { index, track } = tracksWithIndexes[i]
      if (index !== limit)
        this.socket.send({ type: 'moveTrack', payload: { index, trackId: track.id, offset } })
    }
  }
}
