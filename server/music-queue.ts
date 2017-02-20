import * as _ from 'lodash'
import * as promisify from 'es6-promisify'
import * as fs from 'fs'

import { SocketCommunicator } from './socket-communicator'
import { Track } from '../src/app/track'

const mkpath = promisify(require('mkpath'))
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const musicQueue: Track[] = []
// index within musicQueue of current playing track
let currentTrackIndex = -1
// time current track started playing
let trackStarted = new Date()

const getConfigPath = () => `${process.env.HOME}/.local/share/share-deezer`

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

export function insertTrack(socket: SocketCommunicator, { index, track }: { index: number, track: Track }): void {
  musicQueue.splice(index, 0, track)
  if (index <= currentTrackIndex)
    ++currentTrackIndex
  saveQueue()
  socket.broadcast('insert', { track, index })
}

// Get track with given ID closest to index.
function findTrack(index: number, trackId: string) {
  let searchIndex = -1
  let nextIdx
  let bestDistance = Infinity
  // Array#findIndex doesn't accept fromIndex argument
  while ((nextIdx = _.findIndex(musicQueue, track => track.id === trackId, searchIndex + 1)) !== -1) {
    const distance = Math.abs(nextIdx - index)
    if (distance > bestDistance) {
      // we're getting further so give up
      return searchIndex
    }
    else {
      bestDistance = distance
      searchIndex = nextIdx
    }
  }

  return searchIndex
}

export function removeTrack(
  socket: SocketCommunicator,
  { index, trackId } : { index: number, trackId: string }
): void
{
  // find the entry for trackId closest to `index`
  index = findTrack(index, trackId)
  if (index !== -1) {
    if (index === currentTrackIndex)
      trackStarted = new Date()
    else if (index < currentTrackIndex)
      --currentTrackIndex

    musicQueue.splice(index, 1)
    socket.broadcast('remove', index)
  }
}

/**
 * A index of -1 is used to indicate that no track should be the current track.
 */
export function playTrack(
  socket: SocketCommunicator,
  { index, trackId } : { index: number, trackId?: string }
): void
{
  const playNoTrack = index === -1
  index = playNoTrack ? -1 : findTrack(index, trackId)
  if (playNoTrack || index !== -1) {
    currentTrackIndex = index
    trackStarted = new Date()
    socket.broadcast('currentTrack', { index, elapsed: 0 })
  }
}

export function getCurrentTrackStatus(socket: SocketCommunicator) {
  socket.send('currentTrack', {
    index: currentTrackIndex,
    elapsed: (Date.now() - trackStarted.getTime()) / 1000,
  })
}

export async function getMusicQueue(socket: SocketCommunicator): Promise<void> {
  await loadQueue()
  socket.send('musicQueue', musicQueue)
}
