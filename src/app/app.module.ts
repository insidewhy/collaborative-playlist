import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'

import { AppComponent } from './app.component'
import { SearchInputComponent } from './search-input/search-input.component'
import { PlayerControlsComponent } from './player-controls/player-controls.component'

import { AppRoutingModule } from './app-routing.module'
import { SearchResultsComponent } from './search-results/search-results.component'
import { MusicQueueComponent } from './music-queue/music-queue.component'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    SearchInputComponent,
    PlayerControlsComponent,
    SearchResultsComponent,
    MusicQueueComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
