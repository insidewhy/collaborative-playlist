import { Component } from '@angular/core'
import { DeezerPlayer } from '../deezer-player/deezer-player.service'

@Component({
  selector: 'player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss']
})
export class PlayerControlsComponent {
  constructor(private deezerPlayer: DeezerPlayer) {
    // TODO: read mute status from local storage and apply to deezerPlayer
  }

  private toggleMute() {
    const {deezerPlayer} = this
    if (deezerPlayer.activated)
      deezerPlayer.deactivate()
    else
      deezerPlayer.activate()

    // TODO: store mute status in local storage
  }
}
