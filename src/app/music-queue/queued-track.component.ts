import { Component, ChangeDetectionStrategy, Input, ElementRef } from '@angular/core'
import { ObservableInput } from 'observable-input'
import { Observable } from 'rxjs/Observable'
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
    private musicQueue: MusicQueue,
    private elementRef: ElementRef,
  ) {}

  toggle(index: number, selectRange: boolean) {
    this.selectedTracks.toggle(index, selectRange)
  }

  scrollTo() {
    if (! window.scrollTo)
      return
    const {nativeElement} = this.elementRef
    if (! nativeElement)
      return
    // -40 is the margin on the music queue to allow for the search bar, not
    // sure why it is needed here
    window.scrollTo(0, nativeElement.offsetTop - 40)
  }
}
