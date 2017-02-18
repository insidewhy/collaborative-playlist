import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { OnDestroy } from '../on-destroy'
import { ServerSocket } from '../server-socket.service'

@Injectable()
export class MusicQueue extends OnDestroy {
  constructor(private socket: ServerSocket) {
    super()
    this.socket.connect()

    const connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    const messagesSubscription = this.socket.messages.subscribe(message => {
      console.debug('message:', JSON.stringify(message))
    })

    this.onDestroy(() => {
      messagesSubscription.unsubscribe()
      connectionStatusSubscription.unsubscribe()
    })
  }
}
