import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Jsonp } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/map'
// using `import {pick} from 'lodash'` isn't handled by the tree shaker :(
const pick = require('lodash/pick')

import { SearchTerms } from './search-terms.service'
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

  constructor(private searchTerms: SearchTerms, private route: ActivatedRoute, private jsonp: Jsonp) {
    super()
  }

  ngOnInit() {
    const termsStream = this.route.params.map(params => params['terms'])

    this.searchTerms.addRouteStream(termsStream)

    const onTerms = termsStream.subscribe(terms => { this.updateTerms(terms) })
    this.onDestroy(() => { onTerms.unsubscribe() })
  }

  private updateTerms(terms) {
    this.terms = terms

    // 100 is the maximum supported limit
    this.jsonp.get(`http://api.deezer.com/search?q=${terms}&limit=100&output=jsonp&callback=JSONP_CALLBACK`)
    .map(data => data.json().data)
    .subscribe(results => {
      console.debug(results)
      this.searchResults = results.map(result => {
        const {id, title} = result
        const album = pick(result.album, 'title')
        const artist = pick(result.artist, 'name')
        return {id, title, album, artist}
      })
    })
  }

  private selectTrack(track) {
    console.log('TODO: add track to music queue', JSON.stringify(track, null, 2))
  }
}
