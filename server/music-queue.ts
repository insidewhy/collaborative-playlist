import * as _ from 'lodash'

// TODO: read from fs
const musicQueue = []

const saveQueue = _.debounce(() => {
  console.log('TODO: save queue')
}, 1000)

export function addTrack(track, position: number): any[] {
  const ret = musicQueue.splice(position, 0, track)
  saveQueue()
  return ret
}

export function getMusicQueue(): any[] {
  return musicQueue
}
