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
  // TODO: these two should be reactive
  indexes = new BehaviorSubject<Set<number>>(new Set<number>())
  previousSelectedIndex = new BehaviorSubject<number>(-1)
  // TODO: delete
  private selectedByCurrentRange = new Set<number>()

  private toggle$ = new ReplaySubject<Toggle>(1)
  private clear$ = new ReplaySubject<null>(1)
  private delete$ = new ReplaySubject<null>(1)
  private move$ = new ReplaySubject<number>(1)

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
            this.indexes.next(newIndexes)
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

    this.reactTo(
      this.toggle$,
      ({ index, selectRange }) => {
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
    )

    this.reactTo(this.clear$, () => { this.indexes.next(new Set<number>()) })
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
