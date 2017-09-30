import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/distinctUntilChanged'

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
  trackInfo: Observable<any> = Observable.combineLatest(
    this.currentTrack.status,
    this.musicQueue.tracks,
    (trackStatus: CurrentTrackStatus, tracks) => ({trackStatus, tracks})
  )
  .map(({ trackStatus, tracks }) => ({
    trackIdx: trackStatus.trackIdx,
    track: tracks[trackStatus.trackIdx],
    elapsed: Math.round(trackStatus.elapsed / 1000) * 1000,
  }))

  trackDisplay = this.trackInfo.map(
    ({track}) => track && `${track.artist.name} - ${track.album.title} - ${track.title}`
  ).distinctUntilChanged()

  constructor(
    private currentTrack: CurrentTrack,
    private musicQueue: MusicQueue,
  ) {}

  scrollToTrack(trackIdx: number) {
    this.musicQueue.scrollToTrack(trackIdx)
  }
}
