import * as _ from 'lodash'

import { Track } from '../src/app/track'

// TODO: read from fs
let musicQueue: Track[] = []

const saveQueue = _.debounce(() => {
  console.log('TODO: save queue')
}, 1000)

export function insertTrack({ track, position }: { track: Track, position: number }) {
  musicQueue.splice(position, 0, track)
  saveQueue()
  return { insert: position, track }
}

export function removeTrack({ trackId }: { trackId: string }) {
  musicQueue = musicQueue.filter(track => track.id !== trackId)
  return { remove: trackId }
}

export function getMusicQueue(): { musicQueue: Track[] } {
  return { musicQueue }
}
