import { Component, ChangeDetectionStrategy } from '@angular/core'

import { SelectedTracks } from './selected-tracks.service'

@Component({
  selector: 'app-selected-tracks-controls',
  templateUrl: './selected-tracks-controls.component.html',
  styleUrls: ['./selected-tracks-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedTracksControlsComponent {
  constructor(private selectedTracks: SelectedTracks) {}

  public delete() {
    this.selectedTracks.delete()
  }

  public clear() {
    this.selectedTracks.clear()
  }

  public moveSelection(offset: number): void {
    this.selectedTracks.move(offset)
  }
}
