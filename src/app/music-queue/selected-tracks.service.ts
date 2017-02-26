import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

@Injectable()
export class SelectedTracks {
  public indexes = new BehaviorSubject<Set<number>>(new Set<number>())

  toggle(index: number):void {
    const indexesVal = new Set(this.indexes.getValue())
    if (indexesVal.has(index))
      indexesVal.delete(index)
    else
      indexesVal.add(index)
    this.indexes.next(indexesVal)
  }

  clear() {
    this.indexes.next(new Set<number>())
  }
}
