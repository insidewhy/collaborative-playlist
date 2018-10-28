import { delay, map, share, retryWhen } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs'

import websocketConnect from 'rxjs-websockets'

function jsonWebsocketConnect(url: string, input: Observable<object>) {
  const jsonInput = input.pipe(map(message => JSON.stringify(message)))
  const { connectionStatus, messages } = websocketConnect(url, jsonInput)
  const jsonMessages = messages.pipe(map(message => JSON.parse(message)))
  return { connectionStatus, messages: jsonMessages }
}

@Injectable()
export class ServerSocket {
  private input: QueueingSubject<any>
  messages = this.connect()
  connectionStatus: Observable<any>

  private connect() {
    if (this.messages) return

    let { port } = window.location
    if (port === '') port = '80'

    const wsPort = port === '9100' ? '4201' : port

    const { messages, connectionStatus } = jsonWebsocketConnect(
      `ws://${window.location.hostname}:${wsPort}/ws`,
      (this.input = new QueueingSubject<any>()),
    )

    this.connectionStatus = connectionStatus
    return messages.pipe(
      share(),
      retryWhen(errors => errors.pipe(delay(1000))),
    )
  }

  send(message: any): void {
    // console.debug('send', message)
    this.input.next(message)
  }
}
