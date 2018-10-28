import { shareReplay, scan, startWith } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'

import { Source } from '../source'

@Injectable()
export class PlayerControls extends Source {
  private toggleMute$ = new ReplaySubject<void>(1)
  muted = this.toggleMute$.pipe(
    startWith(undefined),
    scan((acc: boolean, _: void): boolean => !acc, !window.localStorage.getItem('muted')),
    shareReplay(1),
  )

  constructor() {
    super()
    this.reactTo(this.muted, muted => {
      if (muted) window.localStorage.setItem('muted', 'true')
      else window.localStorage.removeItem('muted')
    })
  }

  toggleMute() {
    this.toggleMute$.next(undefined)
  }
}
