import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs/Observable'
import websocketConnect from 'rxjs-websockets'

import 'rxjs/add/operator/share'

@Injectable()
export class ServerSocket {
  private inputStream: QueueingSubject<any>
  public outputStream: Observable<any>

  public connect() {
    if (this.outputStream)
      return this.outputStream

    return this.outputStream = websocketConnect(
      'ws://127.0.0.1:4201/ws',
      this.inputStream = new QueueingSubject<any>()
    )
    .share()
  }

  public send(message: any):void {
    this.inputStream.next(message)
  }
}
