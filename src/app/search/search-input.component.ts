import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'

import { SearchTerms } from './search-terms.service'

@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  private terms: String
  private onTerms: Subscription

  constructor(private router: Router, private searchTerms: SearchTerms) {}

  ngOnInit() {
    this.searchTerms.stream.subscribe(terms => { this.terms = terms })
  }

  ngOnDestroy() {
    this.onTerms.unsubscribe()
  }

  onSubmit(terms:String) {
    this.router.navigate(['search', this.terms])
  }
}
