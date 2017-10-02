import { Component, ChangeDetectionStrategy, ElementRef, OnInit, Input } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/interval'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/skipWhile'
import 'rxjs/add/operator/take'

import Animation from '../animation'

@Component({
  selector: 'app-marquee',
  template: `
    <div *ngIf="(overflows | async); else noOverflow">
      <ng-container *ngIf="(display | async); let displayVal">
        <span [style.paddingRight]="margin">{{displayVal}}</span>
        <span [style.paddingRight]="margin">{{displayVal}}</span>
        <span [style.paddingRight]="margin">{{displayVal}}</span>
      </ng-container>
    </div>
    <ng-template #noOverflow>
      {{display | async}}
    </ng-template>
  `,
  styles: [`
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-33.33333%); }
    }

    :host {
      overflow: hidden
    }

    div {
      display: flex;
      flex-shrink: 0;
      animation-name: marquee;
      animation-duration: 5s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `],
})
export class MarqueeComponent implements OnInit {
  @Input() public margin = '2rem'
  @Input() public display: Observable<string>

  public overflows: Observable<boolean>

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.overflows = Observable.from([false]).concat(
      Observable.merge(
        Observable.fromEvent(window, 'resize'),
        this.display,
      )
      .switchMap(() => {
        // disables overflow and waits until the content is not duplicated
        // before testing for overflow again
        return Observable.from([false]).concat(
          Observable.interval(200)
          .map(() => {
            const container: HTMLElement = this.elementRef.nativeElement
            return container && ! container.querySelector('span') && container
          })
          .skipWhile(container => !container)
          .map(container => {
            const { scrollWidth } = container
            return scrollWidth > container.offsetWidth
          })
          .take(1)
        )
      })
    )
  }
}
