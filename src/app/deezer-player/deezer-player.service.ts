import { Injectable } from '@angular/core'

import { OnDestroy } from '../on-destroy'
import { MusicQueue } from '../music-queue/music-queue.service'
import { CurrentTrack } from '../music-queue/current-track.service'

declare var DZ: any

@Injectable()
export class DeezerPlayer extends OnDestroy {
  private activated = false

  constructor(private musicQueue: MusicQueue, private currentTrack: CurrentTrack) {
    super()
  }

  activate() {
    if (this.activated)
      return

    this.activated = true

    const onload = dzState => {
      const trackSubscription = this.currentTrack.stream.subscribe((trackIdx: number) => {
        if (trackIdx !== -1) {
          const track = this.musicQueue.tracks[trackIdx]
          DZ.player.playTracks([ track.id ])
        }
      })

      this.onDestroy(() => {
        trackSubscription.unsubscribe()
      })
    }

    DZ.init({
      appId: '225524',
      channelUrl: window.location + '/assets/channel.html',

      player: { onload },
    })
  }
}
