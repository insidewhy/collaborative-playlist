import { Component } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'

import { CurrentTrack, CurrentTrackStatus } from './current-track.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Track } from '../track'

@Component({
  selector: 'current-track',
  templateUrl: './current-track.component.html',
  styleUrls: ['./current-track.component.scss']
})
export class CurrentTrackComponent {
  private trackInfo: Observable<any>

  constructor(currentTrack: CurrentTrack, private musicQueue: MusicQueue) {
    this.trackInfo = Observable.combineLatest(
      currentTrack.status,
      this.musicQueue.tracks,
      (trackStatus: CurrentTrackStatus, tracks) => ({trackStatus, tracks})
    )
    .map(({ trackStatus, tracks }) => ({
      track: tracks[trackStatus.trackIdx],
      elapsed: Math.round(trackStatus.elapsed / 1000) * 1000,
    }))
  }
}
