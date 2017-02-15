import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'

import 'rxjs/add/operator/mergeMap'

@Injectable()
export class SearchTerms {
  private subject: ReplaySubject<String | Observable<String>>
  public stream: Observable<String>

  constructor() {
    this.subject = new ReplaySubject(1)
    this.stream = this.subject.mergeMap(val => val)
  }

  addRouteStream(stream: Observable<String>) {
    this.subject.next(stream)
  }

  setTerms(terms: String) {
    this.subject.next(terms)
  }
}
