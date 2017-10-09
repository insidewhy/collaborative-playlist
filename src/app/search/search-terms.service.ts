import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'

import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/of'

@Injectable()
export class SearchTerms {
  private subject = new ReplaySubject<Observable<string>>()
  public stream = this.subject.mergeMap(val => val)

  addRouteStream(stream: Observable<string>) {
    this.subject.next(stream)
  }

  setTerms(terms: string) {
    this.subject.next(Observable.of(terms))
  }
}
