import { Component } from '@angular/core'

import { Track } from '../track'
import { MusicQueue } from './music-queue.service'
import { CurrentTrack } from './current-track.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  constructor(private musicQueue: MusicQueue, private currentTrack: CurrentTrack) {}

  playTrack(track: Track, position: number) {
    this.musicQueue.playTrack(track, position)
  }

  removeTrack(track: Track, position: number) {
    this.musicQueue.removeTrack(track, position)
  }
}
