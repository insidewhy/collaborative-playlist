import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Jsonp } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/map'
// using `import {pick} from 'lodash'` isn't handled by the tree shaker :(
const pick = require('lodash/pick')

import { SearchTerms } from './search-terms.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Track } from '../track'
import { OnDestroy } from '../on-destroy'

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent extends OnDestroy {
  private terms: String
  private searchResults: Track[]

  constructor(
    private searchTerms: SearchTerms,
    private route: ActivatedRoute,
    private musicQueue: MusicQueue,
    private jsonp: Jsonp
  )
  { super() }

  ngOnInit() {
    const termsStream = this.route.params.map(params => params['terms'])

    this.searchTerms.addRouteStream(termsStream)

    const onTerms = termsStream.subscribe(terms => { this.updateTerms(terms) })
    this.onDestroy(() => {
      onTerms.unsubscribe()
      this.searchTerms.setTerms('')
    })
  }

  private updateTerms(terms) {
    this.terms = terms

    // 100 is the maximum supported limit
    this.jsonp.get(`http://api.deezer.com/search?q=${terms}&limit=100&output=jsonp&callback=JSONP_CALLBACK`)
    .map(data => data.json().data)
    .subscribe(results => {
      // console.debug(results)
      this.searchResults = results.map(track => {
        const {id, title, duration} = track
        const album = pick(track.album, 'title')
        const artist = pick(track.artist, 'name')
        return {id, title, album, artist, duration: duration * 1000}
      })
    })
  }

  private selectTrack(track) {
    this.musicQueue.insertTrack(track, this.musicQueue.tracks.getValue().length)
  }
}
