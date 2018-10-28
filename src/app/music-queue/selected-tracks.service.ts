
import {merge as observableMerge,  Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs'

import {startWith, scan, filter, map, shareReplay, withLatestFrom, share} from 'rxjs/operators'
import { Injectable } from '@angular/core'
const range = require('lodash/range')
const sortBy = require('lodash/sortBy')

import { Source } from '../source'
import { MusicQueue, TrackWithIndex, Change } from './music-queue.service'

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

function isToggle(operator: Toggle | Change): operator is Toggle {
  return operator.hasOwnProperty('index')
}

@Injectable()
export class SelectedTracks extends Source {
  private toggle$ = new ReplaySubject<Toggle>(1)
  private clear$ = new ReplaySubject<null>(1)
  private delete$ = new ReplaySubject<null>(1)
  private move$ = new ReplaySubject<number>(1)

  rangeStartIdx = this.toggle$.pipe(
    filter(({ selectRange }) => ! selectRange),
    map(({ index }) => index),
    shareReplay(1), )

  indexes: Observable<Set<number>> = this.getIndexes()

  private selectedTracks: Observable<TrackWithIndex[]> = this.indexes.pipe(
    withLatestFrom(this.musicQueue.tracks),
    map(([ indexes, tracks ]) => sortBy(mapSet(
      indexes,
      index => ({ index, track: tracks[index] })
    ), 'index')),
    share(), )

  constructor(private musicQueue: MusicQueue) {
    super()

    this.reactTo(
      this.delete$.pipe(withLatestFrom(this.selectedTracks)),
      ([, selectedTracks]) => {
        selectedTracks.reverse().forEach(({ index, track }) => {
          this.musicQueue.removeTrack(track, index)
        })
        this.clear()
      }
    )

    this.reactTo(
      this.move$.pipe(withLatestFrom(this.selectedTracks)),
      ([ offset, tracks ]) => {
        this.musicQueue.moveTracks(tracks, offset)
      }
    )
  }

  private getIndexes() {
    return observableMerge(this.toggle$, this.clear$, this.musicQueue.changes).pipe(
    withLatestFrom(this.rangeStartIdx),
    scan(
      ({ indexes, prevIndexes }: any, [ operation, rangeStartIdx ]) => {
        // clear
        if (! operation)
          return { indexes: new Set<number>(), prevIndexes: indexes }

        if (isToggle(operation)) {
          const { index, selectRange } = operation
          if (selectRange && rangeStartIdx !== -1) {
            const newIndexes = new Set(prevIndexes)
            range(rangeStartIdx, index + (index > rangeStartIdx ? 1 : -1)).forEach(indexToSelect => {
              if (! newIndexes.has(indexToSelect)) {
                newIndexes.add(indexToSelect)
              }
            })
            return { indexes: newIndexes, prevIndexes: indexes }
          } else {
            const newIndexes = new Set(indexes)
            if (newIndexes.has(index))
              newIndexes.delete(index)
            else
              newIndexes.add(index)
            return { indexes: newIndexes, prevIndexes: indexes }
          }
        } else {
          const { moveFrom, to } = operation
          if (moveFrom !== undefined && indexes.has(moveFrom)) {
            const newIndexes = new Set<number>(indexes)
            newIndexes.delete(moveFrom)
            newIndexes.add(to)
            return { indexes: newIndexes, prevIndexes: indexes }
          } else {
            return { indexes, prevIndexes: indexes }
          }
        }
      },
      { indexes: new Set<number>(), prevIndexes: new Set<number>() }
    ),
    map(({ indexes }) => indexes),
    startWith(new Set<number>()),
    shareReplay(1), )
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
