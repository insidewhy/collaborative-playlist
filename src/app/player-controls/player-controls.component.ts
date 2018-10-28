import { Component, ChangeDetectionStrategy } from '@angular/core'

import { DeezerPlayer } from '../deezer-player/deezer-player.service'
import { CurrentTrack } from '../current-track/current-track.service'
import { PlayerControls } from './player-controls.service'

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerControlsComponent {
  constructor(public currentTrack: CurrentTrack, public playerControls: PlayerControls) {}

  public toggleMute() {
    this.playerControls.toggleMute()
  }

  public play() {
    // TODO: if no track is playing then play the first track instead of resuming
    this.currentTrack.unpause()
  }

  public pause() {
    this.currentTrack.pause()
  }

  public skip(offset: number) {
    this.currentTrack.skip(offset)
  }
}
