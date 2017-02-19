import * as _ from 'lodash'
import * as promisify from 'es6-promisify'
import * as fs from 'fs'

import { SocketCommunicator } from './socket-communicator'
import { Track } from '../src/app/track'

const mkpath = promisify(require('mkpath'))
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const musicQueue: Track[] = []

const getConfigPath = () => `${process.env.HOME}/.config/share-deezer`

const saveQueue = _.debounce(async () => {
  console.log('saving queue')
  try {
    const configPath = getConfigPath()
    await mkpath(configPath)
    await writeFile(`${configPath}/default.playlist.json`, JSON.stringify(musicQueue, null, 2))
  }
  catch (e) {
    console.log('error saving queue', e.stack || e)
  }
}, 1000)

const loadQueue = _.once(async () => {
  try {
    const buffer = await readFile(`${getConfigPath()}/default.playlist.json`)
    musicQueue.splice(0, musicQueue.length, ...JSON.parse(buffer.toString()))
  }
  catch (e) {
    console.log('error loading queue', e.stack || e)
    musicQueue.splice(0)
  }
})

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
  let bestDistance = Infinity
  while ((nextIdx = musicQueue.findIndex(track => track.id !== trackId, idx + 1)) !== -1) {
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

export async function getMusicQueue(socket: SocketCommunicator): Promise<void> {
  await loadQueue()
  socket.send({ musicQueue })
}
