import * as Koa from 'koa'
import * as Router from 'koa-router'

const websockify = require('koa-websocket')
const app: Koa = websockify(new Koa())

function main() {
  console.log('TODO: start server')
  installSocketRoutes()
  app.listen(process.env.API_PORT || 4201)
}

const messageHandlers = {
  getMusicQueue(): string {
    return 'TODO'
  },
}

function installSocketRoutes() {
  const wsRouter = new Router()
  const {ws} = app as any
  ws.use(wsRouter.all('/ws', ctxt => {

    const {websocket} = ctxt as any

    websocket.on('message', message => {
      const { type, payload } = JSON.parse(message)

      try {
        const handler = messageHandlers[type]
        if (! handler) {
          websocket.send(JSON.stringify({ type, payload: 'message type not understood' }))
          return
        }

        const response = handler(payload)
        websocket.send(JSON.stringify({ type, payload: response }))
      }
      catch (e) {
        console.log('unexpected error', e.stack || e)
        websocket.send(JSON.stringify({ type, payload: `error ${e}` }))
      }
    })
  }).routes())
}

main()
