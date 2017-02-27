import { Component } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'

import { OnDestroy } from '../on-destroy'
import { CurrentTrack, CurrentTrackStatus } from './current-track.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Track } from '../track'

@Component({
  selector: 'current-track',
  templateUrl: './current-track.component.html',
  styleUrls: ['./current-track.component.scss']
})
export class CurrentTrackComponent extends OnDestroy {
  private trackStream: Observable<CurrentTrackStatus>
  private track: Track | null
  // elapsed to nearest second
  private elapsed = 0

  constructor(currentTrack: CurrentTrack, private musicQueue: MusicQueue) {
    super()
    this.trackStream = currentTrack.status
  }

  ngOnInit() {
    const trackInfo = Observable.combineLatest(
      this.trackStream,
      this.musicQueue.tracks,
      (trackStatus: CurrentTrackStatus, tracks) => ({trackStatus, tracks})
    )
    .subscribe(({ trackStatus, tracks }) => {
      this.track = tracks[trackStatus.trackIdx]
      this.elapsed = Math.round(trackStatus.elapsed / 1000) * 1000
    })

    this.onDestroy(() => {
      trackInfo.unsubscribe()
    })
  }
}
