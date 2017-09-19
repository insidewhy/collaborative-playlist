import { Component, ChangeDetectionStrategy } from '@angular/core'

import { DeezerPlayer } from '../deezer-player/deezer-player.service'
import { CurrentTrack } from '../current-track/current-track.service'
import { MusicQueue } from '../music-queue/music-queue.service'

@Component({
  selector: 'app-player-controls',
  templateUrl: './player-controls.component.html',
  styleUrls: ['./player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerControlsComponent {
  constructor(
    public deezerPlayer: DeezerPlayer,
    public currentTrack: CurrentTrack,
    private musicQueue: MusicQueue,
  ) {
    const muted = window.localStorage.getItem('muted')
    if (! muted)
      deezerPlayer.activate()
  }

  public toggleMute() {
    const {deezerPlayer} = this
    if (deezerPlayer.activated) {
      deezerPlayer.deactivate()
      window.localStorage.setItem('muted', 'true')
    } else {
      deezerPlayer.activate()
      window.localStorage.removeItem('muted')
    }
  }

  public play() {
    // TODO: if no track is playing then play the first track instead of resuming
    this.currentTrack.unpause()
  }

  public pause() {
    this.currentTrack.pause()
  }

  public skip(offset: number) {
    this.musicQueue.skipTrack(offset)
  }
}
