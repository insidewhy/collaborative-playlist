import { Component } from '@angular/core'

import { SelectedTracks } from './selected-tracks.service'
import { MusicQueue } from './music-queue.service'

const sortBy = require('lodash/sortBy')

@Component({
  selector: 'selected-tracks-controls',
  templateUrl: './selected-tracks-controls.component.html',
  styleUrls: ['./selected-tracks-controls.component.scss']
})
export class SelectedTracksControlsComponent {
  constructor(private selectedTracks: SelectedTracks, private musicQueue: MusicQueue) {}

  private getSelectedTracks() {
    const tracks = []
    this.selectedTracks.indexes.forEach(index => {
      tracks.push({ index, track: this.musicQueue.tracks.getValue()[index] })
    })
    return sortBy(tracks, 'index')
  }

  delete() {
    const tracks = this.getSelectedTracks()
    tracks.reverse().forEach(({ index, track }) => {
      this.musicQueue.removeTrack(track, index)
    })
    this.selectedTracks.clear()
  }
}
