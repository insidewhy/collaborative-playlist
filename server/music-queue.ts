import * as _ from 'lodash'

import { Track } from '../src/app/track'

// TODO: read from fs
let musicQueue: Track[] = []

const saveQueue = _.debounce(() => {
  console.log('TODO: save queue')
}, 1000)

export function addTrack(track, position: number): Track[] {
  musicQueue.splice(position, 0, track)
  saveQueue()
  return musicQueue
}

export function removeTrack(trackId): Track[] {
  return musicQueue = musicQueue.filter(track => track.id !== trackId)
}

export function getMusicQueue(): Track[] {
  return musicQueue
}
