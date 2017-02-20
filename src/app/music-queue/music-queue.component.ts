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

  playTrack(trackId: string, index: number) {
    this.musicQueue.playTrack(trackId, index)
  }

  removeTrack(track: Track, index: number) {
    this.musicQueue.removeTrack(track, index)
  }
}
