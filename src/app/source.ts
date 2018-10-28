import { publishReplay } from 'rxjs/operators'
import { OnDestroy } from '@angular/core'
import { Subject, Observable, ConnectableObservable } from 'rxjs'

export class Source implements OnDestroy {
  protected alive: Subject<void> = new Subject()

  ngOnDestroy() {
    this.alive.complete()
  }

  protected onDestroy(callback: () => void) {
    this.alive.subscribe(null, null, callback)
  }

  hot<T>(observable: Observable<T>): Observable<T> {
    //
    const connectable = observable.pipe(publishReplay(1))
    const connected = (connectable as ConnectableObservable<T>).connect()
    this.onDestroy(() => {
      connected.unsubscribe()
    })
    return connectable
  }

  reactTo<T>(observable: Observable<T>, callback: (T) => any): void {
    const subscription = observable.subscribe(callback)
    this.onDestroy(() => subscription.unsubscribe())
  }
}
