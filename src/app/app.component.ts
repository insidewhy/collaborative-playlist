import { Component } from '@angular/core'
import { SelectedTracks } from './music-queue/selected-tracks.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private selectedTracks: SelectedTracks) {}
}
