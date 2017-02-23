import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs/Observable'
import websocketConnect from 'rxjs-websockets'

import 'rxjs/add/operator/share'
import 'rxjs/add/operator/retryWhen'
import 'rxjs/add/operator/delay'

@Injectable()
export class ServerSocket {
  private input: QueueingSubject<any>
  public messages: Observable<any>
  public connectionStatus: Observable<any>

  public connect() {
    if (this.messages)
      return

    let {port} = window.location
    if (port === '')
      port = '80'

    const wsPort = port === '9000' ? '4201' : port

    const {messages, connectionStatus} = websocketConnect(
      `ws://${window.location.hostname}:${wsPort}/ws`,
      this.input = new QueueingSubject<any>()
    )

    this.messages = messages.share().retryWhen(errors => errors.delay(1000))
    this.connectionStatus = connectionStatus
  }

  public send(message: any):void {
    this.input.next(message)
  }
}
