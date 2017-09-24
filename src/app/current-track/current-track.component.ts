import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/skipWhile'

import { CurrentTrack, CurrentTrackStatus } from './current-track.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Track } from '../track'

@Component({
  selector: 'app-current-track',
  templateUrl: './current-track.component.html',
  styleUrls: ['./current-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentTrackComponent implements OnDestroy {
  private running = true

  trackSubscription = this.currentTrack.index
  .distinctUntilChanged()
  .delay(300)
  .skipWhile(idx => idx !== -1)
  .take(1)
  .subscribe(idx => this.marqueeTrack(this.elementRef.nativeElement))

  trackInfo: Observable<any> = Observable.combineLatest(
    this.currentTrack.status,
    this.musicQueue.tracks,
    (trackStatus: CurrentTrackStatus, tracks) => ({trackStatus, tracks})
  )
  .map(({ trackStatus, tracks }) => ({
    trackIdx: trackStatus.trackIdx,
    track: tracks[trackStatus.trackIdx],
    elapsed: Math.round(trackStatus.elapsed / 1000) * 1000,
  }))

  constructor(
    private currentTrack: CurrentTrack,
    private musicQueue: MusicQueue,
    private elementRef: ElementRef,
  ) {}

  ngOnDestroy() {
    this.trackSubscription.unsubscribe()
    this.running = false
  }

  scrollToTrack(trackIdx: number) {
    this.musicQueue.scrollToTrack(trackIdx)
  }

  private marqueeTrack(node: Element) {
    const trackButton = node.querySelector('button')
    let rateIdx = 0, direction = 1
    const nextFrame = () => {
      if (! this.running)
        return
      if (++rateIdx % 10 === 0) {
        const { scrollHeight, clientHeight } = trackButton
        const scrollTop = Math.round(trackButton.scrollTop)
        if (scrollTop === 0) {
          direction = 1
        }
        else if (scrollTop >= scrollHeight - clientHeight) {
          direction = -1
        }
        trackButton.scrollTop = scrollTop + direction
      }
      window.requestAnimationFrame(nextFrame)
    }
    nextFrame()
  }
}
