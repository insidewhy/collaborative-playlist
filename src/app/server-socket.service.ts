import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import { Observable } from 'rxjs/Observable'
import { WebSocketService } from 'angular2-websocket-service'

@Injectable()
export class ServerSocket {
  private inputStream: QueueingSubject<any>
  public outputStream: Observable<any>

  constructor(private socketFactory: WebSocketService) {}

  public connect() {
    if (this.outputStream)
      return this.outputStream

    this.outputStream = this.socketFactory.connect(
      'ws://127.0.0.1:4201/ws',
      this.inputStream = new QueueingSubject<any>()
    )

    return this.outputStream
  }

  public send(message: any):void {
    this.inputStream.next(message)
  }
}
