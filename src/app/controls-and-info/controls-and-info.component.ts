import { Component } from '@angular/core'

import { SelectedTracks } from '../music-queue/selected-tracks.service'

@Component({
  selector: 'controls-and-info',
  templateUrl: './controls-and-info.component.html',
  styleUrls: ['./controls-and-info.component.scss']
})
export class ControlsAndInfo {
  constructor(private selectedTracks: SelectedTracks) {}
}
