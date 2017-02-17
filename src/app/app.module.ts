import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { JsonpModule } from '@angular/http'
import { MdIconModule, MdIconRegistry } from '@angular2-material/icon'

import { AppComponent } from './app.component'
import { ServerSocket } from './server-socket.service'
import { SearchInputComponent } from './search/search-input.component'
import { PlayerControlsComponent } from './player-controls/player-controls.component'

import { AppRoutingModule } from './app-routing.module'
import { SearchResultsComponent } from './search/search-results.component'
import { MusicQueueComponent } from './music-queue/music-queue.component'

import { SearchTerms } from './search/search-terms.service'
import { MusicQueue } from './music-queue/music-queue.service'

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
    PlayerControlsComponent,
    SearchResultsComponent,
    MusicQueueComponent,
  ],
  providers: [
    MdIconRegistry,
    ServerSocket,
    SearchTerms,
    MusicQueue,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
