import { OnDestroy } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/publishReplay'

export class Source implements OnDestroy {
  protected alive: Subject<void> = new Subject()

  ngOnDestroy() {
    this.alive.complete()
  }

  protected onDestroy(callback: () => void) {
    this.alive.subscribe(null, null, callback)
  }

  hot<T>(observable: Observable<T>): Observable<T> {
    const connectable = observable.publishReplay(1)
    const connected = connectable.connect()
    this.onDestroy(() => { connected.unsubscribe() })
    return connectable
  }

  reactTo<T>(observable: Observable<T>, callback: (T) => any): void {
    const subscription = observable.subscribe(callback)
    this.onDestroy(() => subscription.unsubscribe())
  }
}
