import { OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/distinctUntilChanged'

export class ChangeObserver implements OnChanges, OnDestroy {
  protected ngChanges = new BehaviorSubject<object>({})

  ngOnChanges(changes: SimpleChanges) {
    const props = { ...this.ngChanges.value }
    for (const propName in changes) {
      props[propName] = changes[propName].currentValue
    }
    this.ngChanges.next(props)
  }

  ngOnDestroy() {
    this.ngChanges.complete()
  }

  changes<K extends keyof this>(key: K): Observable<this[K]>
  changes<V>(key: string): Observable<V>
  changes(key: string) {
    return this.ngChanges.map(props => this.ngChanges.value[key]).distinctUntilChanged()
  }
}
