import { Component, ChangeDetectionStrategy, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/distinctUntilChanged'

import { CurrentTrack } from '../current-track/current-track.service'
import { SelectedTracks } from './selected-tracks.service'
import { MusicQueue } from './music-queue.service'
import { Track } from '../track'

@Component({
  selector: 'app-queued-track',
  templateUrl: './queued-track.component.html',
  styleUrls: ['./queued-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueuedTrackComponent {
  // https://github.com/angular/angular/issues/5689
  public indexStream = new BehaviorSubject<number>(-1)
  @Input()
  private set index(value: number) { this.indexStream.next(value) }

  @Input()
  private track: Track

  public isSelected = this.indexStream.switchMap(
    index => this.selectedTracks.indexes.map(indexes => indexes.has(index)).distinctUntilChanged()
  )

  public hasSelection = this.selectedTracks.indexes.map(indexes => indexes.size > 0).distinctUntilChanged()
  public isPlaying = this.indexStream.switchMap(
    index => this.currentTrack.index.map(playingIndex => index === playingIndex).distinctUntilChanged()
  )

  constructor(
    private currentTrack: CurrentTrack,
    private selectedTracks: SelectedTracks,
    private musicQueue: MusicQueue
  ) {}

  toggle(selectRange: boolean) {
    this.selectedTracks.toggle(this.indexStream.value, selectRange)
  }
}
