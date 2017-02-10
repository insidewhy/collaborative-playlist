import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'
import { Observable } from 'rxjs/Observable'

import { SearchTerms } from './search-terms.service'

@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  private terms: String
  private termsStream: Observable<String>
  private onTerms: Subscription

  constructor(private router: Router, searchTerms: SearchTerms) {
    this.termsStream = searchTerms.stream
  }

  ngOnInit() {
    this.termsStream.subscribe(terms => { this.terms = terms })
  }

  ngOnDestroy() {
    this.onTerms.unsubscribe()
  }

  onSubmit(terms:String) {
    this.router.navigate(['search', this.terms])
  }
}
