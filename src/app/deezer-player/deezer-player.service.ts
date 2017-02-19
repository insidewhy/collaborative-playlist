import { Injectable } from '@angular/core'

import { OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { CurrentTrack } from '../music-queue/current-track.service'

declare var DZ: any

@Injectable()
export class DeezerPlayer extends OnDestroy {
  private activated = false

  // TODO: use stream from CurrentTrack instead of ServerSocket
  constructor(private socket: ServerSocket, private musicQueue: MusicQueue, private currentTrack: CurrentTrack) {
    super()
  }

  activate() {
    if (this.activated)
      return

    this.activated = true

    const onload = dzState => {
      console.log('dz is ready', dzState)

      this.socket.connect()

      const trackIdx = this.currentTrack.index
      if (trackIdx !== -1) {
        const track = this.musicQueue.tracks[trackIdx]
        DZ.player.playTracks([ track.id ])
        console.log('initial track is', track)
      }

      const messagesSubscription = this.socket.messages.subscribe(message => {
        const {currentTrack: trackIdx} = message
        if (trackIdx === undefined)
          return

        const track = this.musicQueue.tracks[trackIdx]
        DZ.player.playTracks([ track.id ])
      })

      this.onDestroy(() => {
        messagesSubscription.unsubscribe()
      })
    }

    DZ.init({
      appId: '225524',
      channelUrl: window.location + '/assets/channel.html',

      player: { onload },
    })
  }
}
