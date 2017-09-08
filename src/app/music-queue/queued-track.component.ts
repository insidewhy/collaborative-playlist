import { AfterViewInit, Component, ChangeDetectionStrategy, ElementRef, Input } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'
import 'rxjs/add/observable/combineLatest'

import scrolledIntoView from './scrolled-into-view'
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
export class QueuedTrackComponent implements AfterViewInit {
  @Input()
  private index: number
  @Input()
  private track: Track

  private scrollObservables: BehaviorSubject< Observable<boolean> > = new BehaviorSubject(Observable.from([false]))

  public hasSelection: Observable<boolean> = Observable.combineLatest(
    this.selectedTracks.indexes.map(indexes => indexes.size > 0).distinctUntilChanged(),
    this.scrollObservables.switchMap(val => val),
    (hasSelection, inView) => hasSelection && inView
  )

  public isSelected = this.selectedTracks.indexes.map(indexes => indexes.has(this.index)).distinctUntilChanged()
  public isPlaying = this.currentTrack.index.map(index => index === this.index).distinctUntilChanged()

  constructor(
    private currentTrack: CurrentTrack,
    private selectedTracks: SelectedTracks,
    private musicQueue: MusicQueue,
    private elementRef: ElementRef,
  ) { }

  ngAfterViewInit() {
    const element = this.elementRef.nativeElement as Element
    this.scrollObservables.next(scrolledIntoView(element, document.body, window))
  }

  toggle(selectRange: boolean) {
    this.selectedTracks.toggle(this.index, selectRange)
  }
}
