import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'
import { Observable } from 'rxjs/Observable'

import { onDestroy, OnDestroy } from '../on-destroy'
import { SearchTerms } from './search-terms.service'

@OnDestroy()
@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  private terms: String
  private termsStream: Observable<String>

  constructor(private router: Router, searchTerms: SearchTerms) {
    this.termsStream = searchTerms.stream
  }

  ngOnInit() {
    const onTerms = this.termsStream.subscribe(terms => { this.terms = terms })
    onDestroy(this, () => {
      onTerms.unsubscribe()
    })
  }

  onSubmit(terms:String) {
    this.router.navigate(['search', this.terms])
  }
}
