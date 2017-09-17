import { Component, ChangeDetectionStrategy, ViewChildren, QueryList, OnDestroy } from '@angular/core'

import { MusicQueue } from './music-queue.service'
import { QueuedTrackComponent } from './queued-track.component'

@Component({
  selector: 'app-music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicQueueComponent implements OnDestroy {
  @ViewChildren('tracks') private trackEls: QueryList<QueuedTrackComponent>

  private scrollsSubscription = this.musicQueue.scrolls.subscribe(trackIdx => {
    const trackComponent = this.trackEls.toArray()[trackIdx]
    if (trackComponent)
      trackComponent.scrollTo()
  })

  constructor(public musicQueue: MusicQueue) {}

  ngOnDestroy() {
    this.scrollsSubscription.unsubscribe()
  }
}
