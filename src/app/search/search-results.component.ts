import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import 'rxjs/add/operator/map'

import { SearchTerms } from './search-terms.service'

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  constructor(private searchTerms: SearchTerms, private route: ActivatedRoute) {}

  ngOnInit() {
    this.searchTerms.addRouteStream(this.route.params.map(params => params['terms']))
  }
}
