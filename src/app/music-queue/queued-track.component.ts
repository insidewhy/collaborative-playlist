import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChange } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/buffer'

import { CurrentTrack } from '../current-track/current-track.service'
import { SelectedTracks } from './selected-tracks.service'
import { MusicQueue } from './music-queue.service'
import { Track } from '../track'

class ObservableInputs implements OnChanges {
  private __observedInputs: Map<string, ReplaySubject<any>> = new Map()

  public ngOnChanges(changes: { [key: string]: SimpleChange }) {
    console.log('changes')
    for (let key in changes) {
      const subject = this.__observedInputs.get(key)
      if (subject)
        subject.next(changes[key].currentValue)
    }
  }

  protected observeInput<T>(propName: string): Observable<T> {
    const subject = new ReplaySubject<T>(1)
    this.__observedInputs.set(propName, subject)
    return subject.asObservable()
  }
}

@Component({
  selector: 'app-queued-track',
  templateUrl: './queued-track.component.html',
  styleUrls: ['./queued-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueuedTrackComponent extends ObservableInputs {
  @Input() public index: number
  public index$ = this.observeInput<number>('index')

  @Input()
  public track: Track

  public isSelected = this.index$.switchMap(
    index => this.selectedTracks.indexes.map(indexes => indexes.has(index)).distinctUntilChanged()
  )

  public hasSelection = this.selectedTracks.indexes.map(indexes => indexes.size > 0).distinctUntilChanged()
  public isPlaying = this.index$.switchMap(
    index => this.currentTrack.index.map(playingIndex => index === playingIndex).distinctUntilChanged()
  )

  constructor(
    private currentTrack: CurrentTrack,
    private selectedTracks: SelectedTracks,
    private musicQueue: MusicQueue
  ) {
    super()
  }

  toggle(selectRange: boolean) {
    this.selectedTracks.toggle(this.index, selectRange)
  }
}
