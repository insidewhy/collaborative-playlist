import { Component, ChangeDetectionStrategy } from '@angular/core'

import { SelectedTracks } from './selected-tracks.service'
import { MusicQueue, TrackWithIndex } from './music-queue.service'

const sortBy = require('lodash/sortBy')

@Component({
  selector: 'app-selected-tracks-controls',
  templateUrl: './selected-tracks-controls.component.html',
  styleUrls: ['./selected-tracks-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedTracksControlsComponent {
  constructor(private selectedTracks: SelectedTracks, private musicQueue: MusicQueue) {}

  private getSelectedTracks(): TrackWithIndex[] {
    const tracks = []
    this.selectedTracks.indexes.getValue().forEach(index => {
      tracks.push({ index, track: this.musicQueue.tracks.getValue()[index] })
    })
    return sortBy(tracks, 'index')
  }

  public delete() {
    const tracks = this.getSelectedTracks()
    tracks.reverse().forEach(({ index, track }) => {
      this.musicQueue.removeTrack(track, index)
    })
    this.selectedTracks.clear()
  }

  public clear() {
    this.selectedTracks.clear()
  }

  public moveSelection(offset: number): void {
    this.musicQueue.moveTracks(this.getSelectedTracks(), offset)
  }
}
