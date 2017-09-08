import { Component, ChangeDetectionStrategy, Input } from '@angular/core'
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
  @Input()
  private index: number
  @Input()
  private track: Track

  public isSelected = this.selectedTracks.indexes.map(indexes => indexes.has(this.index)).distinctUntilChanged()
  public hasSelection = this.selectedTracks.indexes.map(indexes => indexes.size > 0).distinctUntilChanged()
  public isPlaying = this.currentTrack.index.map(index => index === this.index).distinctUntilChanged()

  constructor(
    private currentTrack: CurrentTrack,
    private selectedTracks: SelectedTracks,
    private musicQueue: MusicQueue
  ) {}

  toggle(selectRange: boolean) {
    this.selectedTracks.toggle(this.index, selectRange)
  }
}
