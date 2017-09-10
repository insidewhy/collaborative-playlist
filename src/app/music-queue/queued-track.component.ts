import { Component, ChangeDetectionStrategy, Input } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/distinctUntilChanged'

import { ObservableInput } from '../lib/observable-input'
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
  @Input() @ObservableInput()
  public index: Observable<number>

  @Input()
  private track: Track

  public isSelected = this.index.switchMap(
    index => this.selectedTracks.indexes.map(indexes => indexes.has(index)).distinctUntilChanged()
  )

  public hasSelection = this.selectedTracks.indexes.map(indexes => indexes.size > 0).distinctUntilChanged()
  public isPlaying = this.index.switchMap(
    index => this.currentTrack.index.map(playingIndex => index === playingIndex).distinctUntilChanged()
  )

  constructor(
    private currentTrack: CurrentTrack,
    private selectedTracks: SelectedTracks,
    private musicQueue: MusicQueue
  ) {}

  toggle(index: number, selectRange: boolean) {
    this.selectedTracks.toggle(index, selectRange)
  }
}
