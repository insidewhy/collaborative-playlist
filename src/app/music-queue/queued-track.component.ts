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
export class QueuedTrack {
  @Input()
  private index: number
  @Input()
  private track: Track

  constructor(
    private currentTrack: CurrentTrack,
    private selectedTracks: SelectedTracks,
    private musicQueue: MusicQueue
  ) {}

  get isActive() {
    return this.currentTrack.index.map(index => index === this.index).distinctUntilChanged()
  }

  get isSelected() {
    return this.selectedTracks.indexes.map(indexes => indexes.has(this.index)).distinctUntilChanged()
  }

  get hasSelection() {
    return this.selectedTracks.indexes.map(indexes => indexes.size > 0).distinctUntilChanged()
  }

  get isPlaying() {
    return this.currentTrack.index.map(index => index === this.index).distinctUntilChanged()
  }

  toggle(selectRange: boolean) {
    this.selectedTracks.toggle(this.index, selectRange)
  }
}
