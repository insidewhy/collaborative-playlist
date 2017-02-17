import { Component } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { ServerSocket } from '../server-socket.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  private socketSubscription: Subscription
  private connectionStatusSubscription: Subscription

  constructor(private socket: ServerSocket) {}

  ngOnInit() {
    this.socket.connect()

    this.connectionStatusSubscription = this.socket.connectionStatus.subscribe(connected => {
      if (connected)
        this.socket.send({ type: 'getMusicQueue' })
    })

    this.socketSubscription = this.socket.messages.subscribe(message => {
      console.debug('message:', JSON.stringify(message))
    })
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe()
      this.connectionStatusSubscription.unsubscribe()
    }
  }
}
