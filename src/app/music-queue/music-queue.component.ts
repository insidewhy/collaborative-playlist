import { Component } from '@angular/core'

import { Track } from '../track'
import { MusicQueue } from './music-queue.service'
import { CurrentTrack } from './current-track.service'
import { SelectedTracks } from './selected-tracks.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  constructor(private musicQueue: MusicQueue,
              private currentTrack: CurrentTrack,
              private selectedTracks: SelectedTracks)
  {}

  playTrack(trackId: string, index: number) {
    this.musicQueue.playTrack(trackId, index)
  }

  toggleSelection(index: number) {
    this.selectedTracks.toggle(index)
  }
}
