import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as _ from 'lodash'

import { getMusicQueue, insertTrack, removeTrack, playTrack, getCurrentTrackStatus } from './music-queue'
import { SocketCommunicator } from './socket-communicator'

const websockify = require('koa-websocket')
const app: Koa = websockify(new Koa())

function main() {
  console.log('TODO: start server')
  installSocketRoutes()
  app.listen(process.env.API_PORT || 4201)
}

const messageHandlers = {
  getMusicQueue,
  insertTrack,
  removeTrack,
  playTrack,
  getCurrentTrackStatus,
}

function installSocketRoutes() {
  let socketCount = 0
  // sockets by id
  let allSockets = {}

  const wsRouter = new Router()
  const {ws} = app as any
  ws.use(wsRouter.all('/ws', ctxt => {
    const {websocket} = ctxt as any

    const socketId = (++socketCount).toString(36)
    allSockets[socketId] = websocket
    websocket.on('close', () => { delete allSockets[socketId] })

    const broadcast = data => {
      const dataStr = JSON.stringify(data)
      _.forEach(allSockets, (socket: SocketCommunicator) => { socket.send(dataStr) })
    }

    const socketParam = {
      send(data) { websocket.send(JSON.stringify(data)) },
      broadcast,
    }

    websocket.on('message', message => {
      console.log('got message', message)
      const { type, payload } = JSON.parse(message)

      try {
        const handler = messageHandlers[type]
        if (! handler) {
          websocket.send(JSON.stringify({ type, payload: 'message type not understood' }))
          return
        }

        handler(socketParam, payload)
      }
      catch (e) {
        console.log('unexpected error', e.stack || e)
        websocket.send(JSON.stringify({ type, payload: `error ${e}` }))
      }
    })
  }).routes())
}

main()
