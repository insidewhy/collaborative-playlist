import { Component, ChangeDetectionStrategy } from '@angular/core'

import { SelectedTracks } from '../music-queue/selected-tracks.service'

@Component({
  selector: 'app-controls-and-info',
  templateUrl: './controls-and-info.component.html',
  styleUrls: ['./controls-and-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsAndInfoComponent {
  constructor(public selectedTracks: SelectedTracks) {}
}
