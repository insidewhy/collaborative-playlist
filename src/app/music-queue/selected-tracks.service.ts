import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import { OnDestroy } from '../on-destroy'
import { MusicQueue } from './music-queue.service'

@Injectable()
export class SelectedTracks extends OnDestroy {
  public indexes = new BehaviorSubject<Set<number>>(new Set<number>())

  constructor(musicQueue: MusicQueue) {
    super()

    const changeSubscription = musicQueue.changeStream.subscribe(change => {
      const { moveFrom } = change
      if (moveFrom !== undefined) {
        const { to } = change
        const indexesVal = this.indexes.getValue()
        if (indexesVal.has(moveFrom)) {
          const newIndexes = new Set(indexesVal)
          newIndexes.delete(moveFrom)
          newIndexes.add(to)
          this.indexes.next(newIndexes)
        }
      }
    })

    this.onDestroy(() => {
      changeSubscription.unsubscribe()
    })
  }

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
