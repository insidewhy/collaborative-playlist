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

  constructor(private socket: ServerSocket) {
    this.subscribeToMessages()
  }

  subscribeToMessages() {
    const stream = this.socket.connect()

    this.socketSubscription = stream.subscribe(message => {
      console.log('message ', JSON.stringify(message))
    })

    this.socket.send({ type: 'getMusicQueue' })
  }

  ngOnDestroy() {
    // TODO: delay so the next component can reuse?
    if (this.socketSubscription)
      this.socketSubscription.unsubscribe()
  }
}
