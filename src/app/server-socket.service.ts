import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import websocketConnect from 'rxjs-websockets'

import 'rxjs/add/operator/share'
import 'rxjs/add/operator/retryWhen'
import 'rxjs/add/operator/delay'

function jsonWebsocketConnect(url: string, input: Observable<object>) {
  const jsonInput = input.map(message => JSON.stringify(message))
  const { connectionStatus, messages } = websocketConnect(url, jsonInput)
  const jsonMessages = messages.map(message => JSON.parse(message))
  return { connectionStatus, messages: jsonMessages }
}

@Injectable()
export class ServerSocket {
  private input: QueueingSubject<any>
  messages = this.connect()
  connectionStatus: Observable<any>

  private connect() {
    if (this.messages)
      return

    let {port} = window.location
    if (port === '')
      port = '80'

    const wsPort = port === '9000' ? '4201' : port

    const {messages, connectionStatus} = jsonWebsocketConnect(
      `ws://${window.location.hostname}:${wsPort}/ws`,
      this.input = new QueueingSubject<any>()
    )

    this.connectionStatus = connectionStatus
    return messages.share().retryWhen(errors => errors.delay(1000))
  }

  send(message: any): void {
    // console.debug('send', message)
    this.input.next(message)
  }
}
