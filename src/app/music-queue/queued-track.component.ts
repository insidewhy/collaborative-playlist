
import {map, distinctUntilChanged, switchMap} from 'rxjs/operators'
import { Component, ChangeDetectionStrategy, Input, ElementRef } from '@angular/core'
import { ObservableInput } from 'observable-input'
import { Observable } from 'rxjs'


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

  public isSelected = this.index.pipe(switchMap(
    index => this.selectedTracks.indexes.pipe(map(indexes => indexes.has(index)), distinctUntilChanged(), )
  ))

  public hasSelection = this.selectedTracks.indexes.pipe(map(indexes => indexes.size > 0), distinctUntilChanged(), )
  public isPlaying = this.index.pipe(switchMap(
    index => this.currentTrack.index.pipe(map(playingIndex => index === playingIndex), distinctUntilChanged(), )
  ))

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
