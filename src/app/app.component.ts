import { Component } from '@angular/core'
import { Router, NavigationStart } from '@angular/router'
import 'rxjs/add/operator/pairwise'
const defer = require('lodash/defer')

const searchUrlRegex = /^\/search\//

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(router: Router) {
    let scrollBackup = 0

    router.events
    .filter(event => event instanceof NavigationStart)
    .map((event: NavigationStart) => event.url)
    .pairwise()
    .subscribe(([prevUrl, url]) => {
      if (url.match(searchUrlRegex) && url !== prevUrl) {
        scrollBackup = window.scrollY
        window.scrollTo(0, 0)
      }
      else if (url === '/' && prevUrl.match(searchUrlRegex)) {
        defer(() => { window.scrollTo(0, scrollBackup) })
      }
    })
  }
}
