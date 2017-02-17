import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs/Observable'
import websocketConnect from 'rxjs-websockets'

import 'rxjs/add/operator/share'

@Injectable()
export class ServerSocket {
  private input: QueueingSubject<any>
  public messages: Observable<any>
  public connectionStatus: Observable<any>

  public connect() {
    if (this.messages)
      return

    const {messages, connectionStatus} = websocketConnect(
      'ws://127.0.0.1:4201/ws',
      this.input = new QueueingSubject<any>()
    )

    this.messages = messages.share()
    this.connectionStatus = connectionStatus
  }

  public send(message: any):void {
    this.input.next(message)
  }
}
