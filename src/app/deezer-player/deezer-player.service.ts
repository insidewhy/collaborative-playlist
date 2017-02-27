import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'
import { Observable } from 'rxjs/Observable'

import { OnDestroy } from '../on-destroy'
import { MusicQueue } from '../music-queue/music-queue.service'
import { CurrentTrack } from '../current-track/current-track.service'

declare var DZ: any

@Injectable()
export class DeezerPlayer extends OnDestroy {
  private loadedPromise: Promise<null>
  // whether the deezer api is being used
  public activated = false
  private seekOnNext = 0
  private elapsed = Infinity

  constructor(private musicQueue: MusicQueue, private currentTrack: CurrentTrack) {
    super()
  }

  private load(): Promise<null> {
    if (this.loadedPromise)
      return this.loadedPromise

    return this.loadedPromise = new Promise(resolve => {
      const onload = dzState => {
        DZ.Event.subscribe('player_play', this.onPlay.bind(this))
        DZ.Event.subscribe('track_end', this.onTrackEnd.bind(this))
        resolve()
      }

      DZ.init({
        appId: '225524',
        channelUrl: window.location + '/assets/channel.html',

        player: { onload },
      })
    })
  }

  activate() {
    if (this.activated)
      return
    this.activated = true

    this.load().then(() => {
      if (! this.activated)
        return

      const trackStream = this.currentTrack.status
      const currentTrackSubscription = trackStream.subscribe(({trackIdx, elapsed, paused}) => {
        if (trackIdx == -1) {
          DZ.player.pause()
          return
        }

        // avoid replaying when incrementing time
        // TODO: improve this by measuring initial lag etc.
        const prevElapsed = this.elapsed
        this.elapsed = elapsed
        if (elapsed === prevElapsed + 1000)
          return

        const track = this.musicQueue.tracks.getValue()[trackIdx]
        if (track) {
          if (paused) {
            DZ.player.pause()
          }
          else {
            DZ.player.playTracks([ track.id ])
            this.seekOnNext = (elapsed / track.duration) * 100
          }
        }
      })

      const changesSubscription = this.musicQueue.changeStream.subscribe(change => {
        const {removeIdx} = change
        if (removeIdx === this.currentTrack.index.getValue()) {
          const track = this.musicQueue.tracks.getValue()[removeIdx + 1]
          if (track)
            DZ.player.playTracks([ track.id ])
          else
            this.stopPlayer()
        }
      })

      this.onDestroy(() => {
        currentTrackSubscription.unsubscribe()
        changesSubscription.unsubscribe()
      })
    })
  }

  deactivate() {
    if (! this.activated)
      return

    this.stopPlayer()
    this.activated = false
    this.ngOnDestroy()
  }

  private stopPlayer() {
    // sending an empty array to playTracks does nothing!
    DZ.player.pause()
  }

  private onPlay() {
    if (this.seekOnNext) {
      DZ.player.seek(this.seekOnNext)
      this.seekOnNext = 0
    }
  }

  private onTrackEnd() {
    const nextIdx = this.currentTrack.index.getValue() + 1
    if (nextIdx >= this.musicQueue.tracks.getValue().length) {
      this.musicQueue.playTrack(null, -1)
    }
    else {
      const track = this.musicQueue.tracks.getValue()[nextIdx]
      this.musicQueue.playTrack(track.id, nextIdx)
    }
  }
}
