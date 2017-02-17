import { Component } from '@angular/core'

import { MusicQueue } from './music-queue.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  constructor(private musicQueue: MusicQueue) {}

}
