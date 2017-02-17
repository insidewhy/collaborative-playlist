import { Component } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { ServerSocket } from '../server-socket.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  private messagesSubscription: Subscription
  private connectionStatusSubscription: Subscription

  constructor(private socket: ServerSocket) {}

  ngOnInit() {
    this.socket.connect()

    this.connectionStatusSubscription = this.socket.connectionStatus.subscribe(nConnected => {
      if (nConnected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    this.messagesSubscription = this.socket.messages.subscribe(message => {
      console.debug('message:', JSON.stringify(message))
    })
  }

  ngOnDestroy() {
    if (this.messagesSubscription)
      this.messagesSubscription.unsubscribe()

    if (this.connectionStatusSubscription)
      this.connectionStatusSubscription.unsubscribe()
  }
}
