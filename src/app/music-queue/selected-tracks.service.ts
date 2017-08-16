import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
const range = require('lodash/range')

import { OnDestroy } from '../on-destroy'
import { MusicQueue } from './music-queue.service'

@Injectable()
export class SelectedTracks extends OnDestroy {
  public indexes = new BehaviorSubject<Set<number>>(new Set<number>())
  public previousSelectedIndex = new BehaviorSubject<number>(-1)

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

  toggle(index: number, selectRange = false):void {
    const indexesVal = new Set(this.indexes.getValue())

    if (selectRange) {
      const { previousSelectedIndex: { value: prevIndex } } = this
      if (prevIndex !== -1) {
        range(index, prevIndex).forEach(index => {
          if (! indexesVal.has(index))
            indexesVal.add(index)
        })
        this.indexes.next(indexesVal)
        this.previousSelectedIndex.next(index)
        return
      }
    }

    if (indexesVal.has(index))
      indexesVal.delete(index)
    else
      indexesVal.add(index)
    this.indexes.next(indexesVal)
    this.previousSelectedIndex.next(index)
  }

  clear() {
    this.indexes.next(new Set<number>())
  }
}
