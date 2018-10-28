import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SearchResultsComponent } from './search/search-results.component'
import { MusicQueueComponent } from './music-queue/music-queue.component'

const appRoutes: Routes = [
  { path: 'search/:terms', component: SearchResultsComponent },
  { path: '', component: MusicQueueComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
