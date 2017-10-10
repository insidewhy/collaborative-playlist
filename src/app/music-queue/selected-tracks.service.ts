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
  rangeStartIdx = this.toggle$
    .filter(({ selectRange }) => ! selectRange)
    .map(({ index }) => index)
    .shareReplay(1)

  indexes: Observable<Set<number>> = Observable.merge(this.toggle$, this.clear$)
    .withLatestFrom(this.rangeStartIdx)
    .scan(
      (indexes, [ toggle, rangeStartIdx ]) => {
        // a null toggle means clear
        if (! toggle)
          return new Set<number>()

        const { index, selectRange } = toggle

        if (selectRange && rangeStartIdx !== -1) {
          // TODO: previousIndexes rather than indexes
          const newIndexes = new Set(indexes)

          range(rangeStartIdx, index).forEach(indexToSelect => {
            if (! newIndexes.has(indexToSelect)) {
              newIndexes.add(indexToSelect)
            }
          })
          return newIndexes
        } else {
          const newIndexes = new Set(indexes)
          if (newIndexes.has(index))
            newIndexes.delete(index)
          else
            newIndexes.add(index)
          return newIndexes
        }
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
