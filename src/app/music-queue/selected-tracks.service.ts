import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
const range = require('lodash/range')

import { DestructionCallbacks } from '../destruction-callbacks'
import { MusicQueue } from './music-queue.service'

@Injectable()
export class SelectedTracks extends DestructionCallbacks {
  public indexes = new BehaviorSubject<Set<number>>(new Set<number>())
  public previousSelectedIndex = new BehaviorSubject<number>(-1)
  private selectedByCurrentRange = new Set<number>()

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

  toggle(index: number, selectRange = false): void {
    const indexesVal = new Set(this.indexes.getValue())

    if (selectRange) {
      const { previousSelectedIndex: { value: prevIndex } } = this
      if (prevIndex !== -1) {
        const { selectedByCurrentRange } = this
        selectedByCurrentRange.forEach(selectedIndex => { indexesVal.delete(selectedIndex) })
        selectedByCurrentRange.clear()

        range(index, prevIndex).forEach(indexToSelect => {
          if (! indexesVal.has(indexToSelect)) {
            selectedByCurrentRange.add(indexToSelect)
            indexesVal.add(indexToSelect)
          }
        })
        this.indexes.next(indexesVal)
        // this.rangeEndIdx.next(index)
        return
      }
    }

    if (indexesVal.has(index))
      indexesVal.delete(index)
    else
      indexesVal.add(index)
    this.indexes.next(indexesVal)
    this.previousSelectedIndex.next(index)
    this.selectedByCurrentRange.clear()
  }

  clear() {
    this.indexes.next(new Set<number>())
  }
}
