import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, OnInit, Input } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import Animation from '../animation'

@Component({
  selector: 'app-marquee',
  template: '{{display | async}}',
  styles: [ ':host { overflow: hidden }' ],
})
export class MarqueeComponent implements OnDestroy, OnInit {
  @Input() private display: Observable<string>
  private displaySubscription: Subscription | null
  private marqueeAnimation: Animation | null

  constructor(private elementRef: ElementRef) {}

  private getScrollable(): Element | null {
    return this.elementRef.nativeElement
  }

  ngOnInit() {
    let marquee: Element | null
    let direction = 1
    this.marqueeAnimation = new Animation(() => {
      // this shit has to be replaced with a css animation... it is jerky and error prone
      if (! marquee) {
        marquee = this.getScrollable()
        if (! marquee)
          return
      }
      const { scrollWidth, clientWidth } = marquee
      const scrollLeft = Math.ceil(marquee.scrollLeft)
      if (scrollLeft === 0) {
        direction = 1
      } else if (scrollLeft >= scrollWidth - clientWidth) {
        direction = -1
      }
      marquee.scrollLeft = scrollLeft + direction
    }, 3)

    this.displaySubscription = this.display.subscribe(() => {
      marquee = this.getScrollable()
      if (marquee)
        marquee.scrollLeft = 0
    })
  }

  ngOnDestroy() {
    if (this.displaySubscription) {
      this.displaySubscription.unsubscribe()
    }
    if (this.marqueeAnimation)
      this.marqueeAnimation.stop()
  }

}
