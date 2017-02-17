import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { ServerSocket } from '../server-socket.service'

@Injectable()
export class MusicQueue {
  private messagesSubscription: Subscription
  private connectionStatusSubscription: Subscription

  constructor(private socket: ServerSocket) {
    this.socket.connect()

    this.connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    this.messagesSubscription = this.socket.messages.subscribe(message => {
      console.debug('message:', JSON.stringify(message))
    })
  }

  /**
   * https://angular.io/docs/ts/latest/api/core/index/OnDestroy-class.html says that it
   * is called when a service is destroyed.
   */
  ngOnDestroy() {
    if (this.messagesSubscription)
      this.messagesSubscription.unsubscribe()

    if (this.connectionStatusSubscription)
      this.connectionStatusSubscription.unsubscribe()
  }
}
