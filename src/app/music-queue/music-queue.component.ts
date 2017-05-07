import { Component } from '@angular/core'

import { Track } from '../track'
import { MusicQueue } from './music-queue.service'
import { CurrentTrack } from '../current-track/current-track.service'
import { SelectedTracks } from './selected-tracks.service'

@Component({
  selector: 'music-queue',
  templateUrl: './music-queue.component.html',
  styleUrls: ['./music-queue.component.scss']
})
export class MusicQueueComponent {
  constructor(public musicQueue: MusicQueue,
              private currentTrack: CurrentTrack,
              private selectedTracks: SelectedTracks)
  {}

  toggle(index: number, event) {
    const selectRange = event.shiftKey
    this.selectedTracks.toggle(index, selectRange)
    // TODO: something better than this to prevent shift key selecting text
    if (selectRange)
      document.getSelection().removeAllRanges()
  }
}
