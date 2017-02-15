import { Component } from '@angular/core'

import { ServerSocket } from '../server-socket.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  constructor(private socket: ServerSocket) {
    this.subscribeToMessages()
  }

  async subscribeToMessages() {
    const stream = await this.socket.connect()

    stream.subscribe(message => {
      console.log('message ', JSON.stringify(message))
    })

    this.socket.send({ type: 'getMusicQueue' })
  }
}
