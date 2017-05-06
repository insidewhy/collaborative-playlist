import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Jsonp } from '@angular/http'
import { Observable } from 'rxjs/Observable'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/concat'
import 'rxjs/add/observable/combineLatest'
// using `import {pick} from 'lodash'` isn't handled by the tree shaker :(
const pick = require('lodash/pick')

import { SearchTerms } from './search-terms.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { Album } from '../album'
import { Track } from '../track'
import { OnDestroy } from '../on-destroy'

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent extends OnDestroy {
  private terms: string

  public searchResults: Observable<Array<Track | Album>>

  constructor(
    private searchTerms: SearchTerms,
    private route: ActivatedRoute,
    private musicQueue: MusicQueue,
    private jsonp: Jsonp
  )
  {
    super()
  }

  ngOnInit() {
    const termsStream = this.route.params.map(params => params['terms'])

    this.searchTerms.addRouteStream(termsStream)

    this.searchResults = termsStream.switchMap(terms => {
      return Observable.combineLatest(
        this.jsonp.get(`http://api.deezer.com/search?q=${terms}&limit=100&output=jsonp&callback=JSONP_CALLBACK`)
          .map(data => data.json().data)
          .map(results => {
            // console.debug(results)
            return results.map(track => {
              const {id, title, duration} = track
              const album = pick(track.album, 'title')
              const artist = pick(track.artist, 'name')
              return {id, title, album, artist, duration: duration * 1000}
            })
          }),
        this.jsonp.get(`http://api.deezer.com/search/album?q=${terms}&limit=100&output=jsonp&callback=JSONP_CALLBACK`)
          .map(data => data.json().data)
          .map(results => {
            return results.map(album => {
              const {id, title} = album
              const artist = pick(album.artist, 'name')
              return {id, title, artist}
            })
          }),
        (tracks, albums) => [ ...albums, ...tracks ]
      )
    })

    this.onDestroy(() => {
      this.searchTerms.setTerms('')
    })
  }

  private selectResult(result) {
    if (result.album) {
      this.musicQueue.insertTrack(result, this.musicQueue.tracks.getValue().length)
    }
    else {
      const album = pick(result, 'title')
      this.jsonp.get(`http://api.deezer.com/album/${result.id}/tracks?output=jsonp&callback=JSONP_CALLBACK`)
      .map(data => data.json().data)
      .map(results => {
        return results.map(track => {
          const {id, title, duration} = track
          const artist = pick(track.artist, 'name')
          return {id, title, album, artist, duration: duration * 1000}
        })
      })
      .subscribe(tracks => {
        let {length} = this.musicQueue.tracks.getValue()
        tracks.forEach(track => { this.musicQueue.insertTrack(track, length++) })
      })
    }
  }
}
