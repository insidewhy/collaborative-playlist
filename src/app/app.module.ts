import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { JsonpModule } from '@angular/http'
import { MdIconModule, MdIconRegistry } from '@angular2-material/icon'

import { AppComponent } from './app.component'
import { ServerSocket } from './server-socket.service'
import { SearchInputComponent } from './search/search-input.component'
import { ControlsAndInfo } from './controls-and-info.component'
import { PlayerControlsComponent } from './player-controls/player-controls.component'

import { AppRoutingModule } from './app-routing.module'
import { SearchResultsComponent } from './search/search-results.component'
import { MusicQueueComponent } from './music-queue/music-queue.component'
import { SelectedTracksControlsComponent } from './music-queue/selected-tracks-controls.component'
import { TrackDurationPipe } from './track-duration.pipe'

import { SearchTerms } from './search/search-terms.service'
import { MusicQueue } from './music-queue/music-queue.service'
import { SelectedTracks } from './music-queue/selected-tracks.service'
import { CurrentTrack } from './music-queue/current-track.service'
import { DeezerPlayer } from './deezer-player/deezer-player.service'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    JsonpModule,
    MdIconModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    SearchInputComponent,
    ControlsAndInfo,
    PlayerControlsComponent,
    SearchResultsComponent,
    MusicQueueComponent,
    SelectedTracksControlsComponent,
    TrackDurationPipe,
  ],
  providers: [
    MdIconRegistry,
    ServerSocket,
    SearchTerms,
    MusicQueue,
    SelectedTracks,
    CurrentTrack,
    DeezerPlayer,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
