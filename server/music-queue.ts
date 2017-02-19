import * as _ from 'lodash'

import { SocketCommunicator } from './socket-communicator'
import { Track } from '../src/app/track'

// TODO: read from fs
let musicQueue: Track[] = []

const saveQueue = _.debounce(() => {
  console.log('TODO: save queue')
}, 1000)

export function insertTrack(socket: SocketCommunicator, { position, track }: { position: number, track: Track }): void {
  musicQueue.splice(position, 0, track)
  saveQueue()
  socket.broadcast({ insert: position, track })
}

export function removeTrack(socket: SocketCommunicator, { trackId }, { trackId: string }): void {
  musicQueue = musicQueue.filter(track => track.id !== trackId)
  socket.broadcast({ remove: trackId })
}

export function getMusicQueue(socket: SocketCommunicator): void {
  socket.send({ musicQueue })
}
