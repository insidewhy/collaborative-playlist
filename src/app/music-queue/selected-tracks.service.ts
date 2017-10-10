import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { ReplaySubject } from 'rxjs/ReplaySubject'
const range = require('lodash/range')
const sortBy = require('lodash/sortBy')

import { Source } from '../source'
import { MusicQueue, TrackWithIndex } from './music-queue.service'

const mapSet = (set, callback) => {
  const ret = []
  set.forEach(val => {
    ret.push(callback(val))
  })
  return ret
}

interface Toggle {
  index: number
  selectRange: boolean
}

@Injectable()
export class SelectedTracks extends Source {
  private toggle$ = new ReplaySubject<Toggle>(1)
  private clear$ = new ReplaySubject<null>(1)
  private delete$ = new ReplaySubject<null>(1)
  private move$ = new ReplaySubject<number>(1)

  // mega TODO: should be reactive
  previousSelectedIndex = new BehaviorSubject<number>(-1)

  indexes: Observable<Set<number>> = Observable.merge(this.toggle$, this.clear$)
    .scan(
      (prevIndexes, toggle) => {
        // a null toggle means clear
        if (! toggle)
          return new Set<number>()

        const { index, selectRange } = toggle

        // if (selectRange) {
        //   const { previousSelectedIndex: { value: prevIndex } } = this
        //   if (prevIndex !== -1) {
        //     const { selectedByCurrentRange } = this
        //     selectedByCurrentRange.forEach(selectedIndex => { prevIndexes.delete(selectedIndex) })
        //     selectedByCurrentRange.clear()

        //     range(index, prevIndex).forEach(indexToSelect => {
        //       if (! prevIndexes.has(indexToSelect)) {
        //         selectedByCurrentRange.add(indexToSelect)
        //         prevIndexes.add(indexToSelect)
        //       }
        //     })
        //     this.indexes.next(prevIndexes)
        //     // this.rangeEndIdx.next(index)
        //     return
        //   }
        // }

        const indexes = new Set(prevIndexes)
        if (indexes.has(index))
          indexes.delete(index)
        else
          indexes.add(index)
        this.previousSelectedIndex.next(index)
        return indexes
      },
      new Set<number>()
    )
    .startWith(new Set<number>())
    .shareReplay(1)

  private selectedTracks: Observable<TrackWithIndex[]> = this.indexes
    .withLatestFrom(this.musicQueue.tracks)
    .map(([ indexes, tracks ]) => sortBy(mapSet(
      indexes,
      index => ({ index, track: tracks[index] })
    ), 'index'))
    .share()

  constructor(private musicQueue: MusicQueue) {
    super()

    this.reactTo(
      musicQueue.changes.withLatestFrom(this.indexes),
      ([ change, indexes ]) => {
        const { moveFrom } = change
        if (moveFrom !== undefined) {
          const { to } = change
          if (indexes.has(moveFrom)) {
            const newIndexes = new Set<number>(indexes)
            newIndexes.delete(moveFrom)
            newIndexes.add(to)
            // mega TODO: move higher
            // this.indexes.next(newIndexes)
          }
        }
      },
    )

    this.reactTo(
      this.delete$.withLatestFrom(this.selectedTracks),
      ([, selectedTracks]) => {
        selectedTracks.reverse().forEach(({ index, track }) => {
          this.musicQueue.removeTrack(track, index)
        })
        this.clear()
      }
    )

    this.reactTo(
      this.move$.withLatestFrom(this.selectedTracks),
      ([ offset, tracks ]) => {
        this.musicQueue.moveTracks(tracks, offset)
      }
    )
  }

  toggle(index: number, selectRange = false): void {
    this.toggle$.next({ index, selectRange })
  }

  clear() {
    this.clear$.next(undefined)
  }

  delete() {
    this.delete$.next(undefined)
  }

  move(offset: number): void {
    this.move$.next(offset)
  }
}
