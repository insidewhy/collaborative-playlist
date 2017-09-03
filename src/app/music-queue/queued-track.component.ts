import { Component, ChangeDetectionStrategy, Input } from '@angular/core'

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

  toggle(selectRange: boolean) {
    this.selectedTracks.toggle(this.index, selectRange)
  }
}
