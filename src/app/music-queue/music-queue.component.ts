import { Component, ChangeDetectionStrategy } from '@angular/core'

import { MusicQueue } from './music-queue.service'

@Component({
  selector: 'app-music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicQueueComponent {
  constructor(public musicQueue: MusicQueue) {}
}
