import {join as pathJoin} from 'path'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as koaStatic from 'koa-static'
import * as _ from 'lodash'

import * as musicQueueHandlers from './music-queue'

const websockify = require('koa-websocket')
const app: Koa = websockify(new Koa())

function main() {
  console.log('TODO: start server')
  installSocketRoutes()

  app.use(koaStatic(pathJoin(__dirname, '..', 'client')))

  app.listen(process.env.PORT || 4201)
}

const messageHandlers = { ...musicQueueHandlers }

function installSocketRoutes() {
  let socketCount = 0
  // sockets by id
  let allSockets = {}

  const broadcast = (type, payload) => {
    const dataStr = JSON.stringify({ type, payload })
    console.log('bcst', dataStr)
    _.forEach(allSockets, (socket: any) => { socket.send(dataStr) })
  }

  const send = (websocket, type, payload) => {
    const dataStr = JSON.stringify({ type, payload })
    if (dataStr.length < 100)
      console.log('send', dataStr)
    websocket.send(dataStr)
  }

  const wsRouter = new Router()
  const {ws} = app as any
  ws.use(wsRouter.all('/ws', ctxt => {
    const {websocket} = ctxt as any

    const socketId = (++socketCount).toString(36)
    allSockets[socketId] = websocket
    websocket.on('close', () => { delete allSockets[socketId] })

    const socketParam = { send: send.bind(null, websocket), broadcast }

    websocket.on('message', message => {
      console.log('recv', message)
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
