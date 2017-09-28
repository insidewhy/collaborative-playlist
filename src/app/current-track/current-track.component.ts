import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/skipWhile'

import { CurrentTrack, CurrentTrackStatus } from './current-track.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Track } from '../track'
import Animation from '../animation'

@Component({
  selector: 'app-current-track',
  templateUrl: './current-track.component.html',
  styleUrls: ['./current-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentTrackComponent implements OnDestroy, OnInit {
  private marqueeAnimation: Animation | null

  // reset marquee scroll position when track changes
  trackSubscription = this.currentTrack.index
  .distinctUntilChanged()
  .skipWhile(idx => idx !== -1)
  .subscribe(idx => {
    const marquee = this.getMarqueeElement()
    if (marquee)
      marquee.scrollLeft = 0
  })

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

  ngOnInit() {
    this.startMarqueeAnimation()
  }

  ngOnDestroy() {
    this.trackSubscription.unsubscribe()
    if (this.marqueeAnimation)
      this.marqueeAnimation.stop()
  }

  scrollToTrack(trackIdx: number) {
    this.musicQueue.scrollToTrack(trackIdx)
  }

  private getMarqueeElement(): Element | null {
    return this.elementRef.nativeElement.querySelector('button')
  }

  private startMarqueeAnimation() {
    let marquee: Element | null
    let direction = 1
    this.marqueeAnimation = new Animation(() => {
      if (! marquee) {
        marquee = this.getMarqueeElement()
        if (! marquee)
          return
      }
      const { scrollWidth, clientWidth } = marquee
      const scrollLeft = Math.round(marquee.scrollLeft)
      if (scrollLeft === 0) {
        direction = 1
      } else if (scrollLeft >= scrollWidth - clientWidth) {
        direction = -1
      }
      marquee.scrollLeft = scrollLeft + direction
    }, 3)
  }
}
