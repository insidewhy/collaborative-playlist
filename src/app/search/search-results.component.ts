import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Jsonp } from '@angular/http'

import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/map'

import { SearchTerms } from './search-terms.service'
import { Track } from '../track'

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  private terms: String
  private onTerms: Subscription
  private searchResults: Track[]

  constructor(private searchTerms: SearchTerms, private route: ActivatedRoute, private jsonp: Jsonp) {}

  ngOnInit() {
    const termsStream = this.route.params.map(params => params['terms'])

    this.searchTerms.addRouteStream(termsStream)

    this.onTerms = termsStream.subscribe(terms => { this.updateTerms(terms) })
  }

  ngOnDestroy() {
    this.onTerms.unsubscribe()
  }

  private updateTerms(terms) {
    this.terms = terms

    // 100 is the maximum supported limit
    this.jsonp.get(`http://api.deezer.com/search?q=${terms}&limit=100&output=jsonp&callback=JSONP_CALLBACK`)
    .map(data => data.json().data)
    .subscribe(results => {
      console.debug(results)
      this.searchResults = results.map(result => {
        const {id, title, type, album, artist} = result
        return {id, title, type, album, artist}
      })
    })
  }
}
