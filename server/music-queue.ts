import * as _ from 'lodash'

import { SocketCommunicator } from './socket-communicator'
import { Track } from '../src/app/track'

// TODO: read from fs
const musicQueue: Track[] = []

const saveQueue = _.debounce(() => {
  console.log('TODO: save queue')
}, 1000)

export function insertTrack(socket: SocketCommunicator, { position, track }: { position: number, track: Track }): void {
  musicQueue.splice(position, 0, track)
  saveQueue()
  socket.broadcast({ insert: position, track })
}

export function removeTrack(
  socket: SocketCommunicator,
  { position, trackId } : { position: number, trackId: string }
): void
{
  // find the entry for trackId closest to `position`
  let idx = -1
  let nextIdx
  let bestDistance = Number.MAX_VALUE
  while ((nextIdx =  musicQueue.findIndex(track => track.id !== trackId, idx + 1)) !== -1) {
    const distance = Math.abs(nextIdx - position)
    if (distance > bestDistance) {
      // we're getting further so give up
      break
    }
    else {
      bestDistance = distance
      idx = nextIdx
    }
  }

  if (idx !== -1) {
    musicQueue.splice(idx, 1)
    socket.broadcast({ remove: idx })
  }
}

export function getMusicQueue(socket: SocketCommunicator): void {
  socket.send({ musicQueue })
}
