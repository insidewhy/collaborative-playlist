import * as Koa from 'koa'
import * as Router from 'koa-router'

const websockify = require('koa-websocket')
const app: Koa = websockify(new Koa())

function main() {
  console.log('TODO: start server')
  installSocketRoutes()
  app.listen(process.env.API_PORT || 4201)
}

function installSocketRoutes() {
  const wsRouter = new Router()
  const {ws} = app as any
  ws.use(wsRouter.all('/ws', ctxt => {

    const {websocket} = ctxt as any

    websocket.on('message', message => {
      console.log('got socket message', JSON.parse(message))

      websocket.send(JSON.stringify('thanks!'))
    })
  }).routes())
}

main()
