import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { onDestroy, OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'

@OnDestroy()
@Injectable()
export class MusicQueue {
  constructor(private socket: ServerSocket) {
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      console.debug('message:', JSON.stringify(message))
    })

    onDestroy(this, () => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }
}
