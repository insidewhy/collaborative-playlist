import { Component, ChangeDetectionStrategy } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'

import { CurrentTrack, CurrentTrackStatus } from './current-track.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Track } from '../track'

@Component({
  selector: 'app-current-track',
  templateUrl: './current-track.component.html',
  styleUrls: ['./current-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentTrackComponent {
  public trackInfo: Observable<any>

  constructor(currentTrack: CurrentTrack, private musicQueue: MusicQueue) {
    this.trackInfo = Observable.combineLatest(
      currentTrack.status,
      this.musicQueue.tracks,
      (trackStatus: CurrentTrackStatus, tracks) => ({trackStatus, tracks})
    )
    .map(({ trackStatus, tracks }) => ({
      trackIdx: trackStatus.trackIdx,
      track: tracks[trackStatus.trackIdx],
      elapsed: Math.round(trackStatus.elapsed / 1000) * 1000,
    }))
  }

  scrollToTrack(trackIdx: number) {
    this.musicQueue.scrollToTrack(trackIdx)
  }
}
