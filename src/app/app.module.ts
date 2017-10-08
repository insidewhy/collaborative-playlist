import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { JsonpModule } from '@angular/http'
import { MdIconModule, MdIconRegistry } from '@angular/material'

import { AppComponent } from './app.component'
import { ServerSocket } from './server-socket.service'
import { SearchInputComponent } from './search/search-input.component'
import { ControlsAndInfoComponent } from './controls-and-info/controls-and-info.component'
import { PlayerControlsComponent } from './player-controls/player-controls.component'
import { PlayerControls } from './player-controls/player-controls.service'

import { AppRoutingModule } from './app-routing.module'
import { SearchResultsComponent } from './search/search-results.component'
import { MusicQueueComponent } from './music-queue/music-queue.component'
import { QueuedTrackComponent } from './music-queue/queued-track.component'
import { SelectedTracksControlsComponent } from './music-queue/selected-tracks-controls.component'
import { TrackDurationPipe } from './track-duration.pipe'

import { SearchTerms } from './search/search-terms.service'
import { MusicQueue } from './music-queue/music-queue.service'
import { SelectedTracks } from './music-queue/selected-tracks.service'
import { CurrentTrack } from './current-track/current-track.service'
import { DeezerPlayer } from './deezer-player/deezer-player.service'
import { CurrentTrackComponent } from './current-track/current-track.component'
import { MarqueeComponent } from './current-track/marquee.component'

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
    ControlsAndInfoComponent,
    PlayerControlsComponent,
    SearchResultsComponent,
    MusicQueueComponent,
    QueuedTrackComponent,
    SelectedTracksControlsComponent,
    TrackDurationPipe,
    CurrentTrackComponent,
    MarqueeComponent,
  ],
  providers: [
    MdIconRegistry,
    ServerSocket,
    SearchTerms,
    MusicQueue,
    SelectedTracks,
    CurrentTrack,
    DeezerPlayer,
    PlayerControls,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
