import { Component } from '@angular/core'

import { DeezerPlayer } from '../deezer-player/deezer-player.service'
import { CurrentTrack } from '../current-track/current-track.service'

@Component({
  selector: 'player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss']
})
export class PlayerControlsComponent {
  constructor(private deezerPlayer: DeezerPlayer, private currentTrack: CurrentTrack) {
    // TODO: read mute status from local storage and apply to deezerPlayer
    const muted = window.localStorage.getItem('muted')
    if (! muted)
      deezerPlayer.activate()
  }

  private toggleMute() {
    const {deezerPlayer} = this
    if (deezerPlayer.activated) {
      deezerPlayer.deactivate()
      window.localStorage.setItem('muted', 'true')
    }
    else {
      deezerPlayer.activate()
      window.localStorage.removeItem('muted')
    }
  }

  private play() {
    // TODO: if no track is playing then play the first track instead of resuming
    this.currentTrack.unpause()
  }

  private pause() {
    this.currentTrack.pause()
  }
}
