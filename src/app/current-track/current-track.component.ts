
import {combineLatest as observableCombineLatest,  Observable ,  Subscription } from 'rxjs'

import {distinctUntilChanged, map} from 'rxjs/operators'
import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core'



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
  trackInfo: Observable<any> = observableCombineLatest(
    this.currentTrack.status,
    this.musicQueue.tracks,
    (trackStatus: CurrentTrackStatus, tracks) => ({trackStatus, tracks})
  ).pipe(
  map(({ trackStatus, tracks }) => ({
    trackIdx: trackStatus.trackIdx,
    track: tracks[trackStatus.trackIdx],
    elapsed: Math.round(trackStatus.elapsed / 1000) * 1000,
  })))

  trackDisplay = this.trackInfo.pipe(map(
    ({track}) => track && `${track.artist.name} - ${track.album.title} - ${track.title}`
  ), distinctUntilChanged(), )

  constructor(
    private currentTrack: CurrentTrack,
    private musicQueue: MusicQueue,
  ) {}

  clickedCurrentTrack() {
    this.currentTrack.goToCurrent()
  }
}
