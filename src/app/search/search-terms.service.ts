import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/of'

@Injectable()
export class SearchTerms {
  private termsObservables = new ReplaySubject<Observable<string>>()
  terms = this.termsObservables.mergeMap(val => val)

  addRouteStream(terms: Observable<string>) {
    this.termsObservables.next(terms)
  }

  setTerms(terms: string) {
    this.termsObservables.next(Observable.of(terms))
  }
}
