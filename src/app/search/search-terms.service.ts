
import {of as observableOf,  ReplaySubject ,  Observable } from 'rxjs'

import {mergeMap} from 'rxjs/operators'
import { Injectable } from '@angular/core'



@Injectable()
export class SearchTerms {
  private termsObservables = new ReplaySubject<Observable<string>>()
  terms = this.termsObservables.pipe(mergeMap(val => val))

  addRouteStream(terms: Observable<string>) {
    this.termsObservables.next(terms)
  }

  setTerms(terms: string) {
    this.termsObservables.next(observableOf(terms))
  }
}
