import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'

import { Source } from '../source'

@Injectable()
export class PlayerControls extends Source {
  private toggleMute$ = new ReplaySubject<void>(1)
  muted = this.toggleMute$.startWith(undefined).scan(acc => ! acc, ! window.localStorage.getItem('muted'))

  constructor() {
    super()
    this.reactTo(this.muted, muted => {
      if (muted)
        window.localStorage.setItem('muted', 'true')
      else
        window.localStorage.removeItem('muted')
    })
  }

  toggleMute() { this.toggleMute$.next(undefined) }
}
