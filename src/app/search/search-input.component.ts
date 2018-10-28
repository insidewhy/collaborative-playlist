import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription, Observable } from 'rxjs'

import { DestructionCallbacks } from '../destruction-callbacks'
import { SearchTerms } from './search-terms.service'

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent extends DestructionCallbacks implements OnInit {
  public terms: String
  private termsStream: Observable<String>

  constructor(private router: Router, searchTerms: SearchTerms) {
    super()
    this.termsStream = searchTerms.terms
  }

  ngOnInit() {
    const onTerms = this.termsStream.subscribe(terms => {
      this.terms = terms
    })
    this.onDestroy(() => {
      onTerms.unsubscribe()
    })
  }

  onSubmit() {
    if (!this.terms.length) this.router.navigate([''])
    else this.router.navigate(['search', this.terms])
  }
}
