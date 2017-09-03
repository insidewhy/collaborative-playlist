import * as _ from 'lodash'
import * as promisify from 'es6-promisify'
import * as fs from 'fs'

import { SocketCommunicator } from './socket-communicator'
import { Track } from '../src/app/track'
import { TrackState } from './track-state'

const mkpath = promisify(require('mkpath'))
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const musicQueue: Track[] = []
// time current track started playing

const trackState = new TrackState()

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
  if (index <= trackState.index)
    ++trackState.index
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
    } else {
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
  if (index === -1)
    return

  if (index === trackState.index)
    trackState.play()
  else if (index < trackState.index)
    --trackState.index

  musicQueue.splice(index, 1)
  socket.broadcast('remove', index)
}

function sendCurrentTrackState(socket: SocketCommunicator) {
  const { index, paused } = trackState
  const elapsed = trackState.getElapsed()
  socket.broadcast('currentTrack', { index, elapsed, paused })
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
    trackState.index = index
    trackState.play()
    sendCurrentTrackState(socket)
  }
}

export function pauseTrack(socket: SocketCommunicator, unpause: boolean): void {
  if (unpause)
    trackState.unpause()
  else
    trackState.pause()
  sendCurrentTrackState(socket)
}

export function moveTrack(
  socket: SocketCommunicator,
  { index, trackId, offset } : { index: number, trackId: string, offset: number }
): void
{
  index = findTrack(index, trackId)
  if (index === -1)
    return

  const newIndex = index + offset
  if (newIndex < 0 || newIndex >= musicQueue.length)
    return

  musicQueue.splice(newIndex, 0, ...musicQueue.splice(index, 1))
  socket.broadcast('move', { index, offset })
}

export function getCurrentTrackStatus(socket: SocketCommunicator) {
  socket.send('currentTrack', {
    index: trackState.index,
    elapsed: trackState.getElapsed(),
    paused: trackState.paused,
  })
}

export async function getMusicQueue(socket: SocketCommunicator): Promise<void> {
  await loadQueue()
  socket.send('musicQueue', musicQueue)
}
