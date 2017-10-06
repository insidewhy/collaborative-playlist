import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Jsonp } from '@angular/http'
import { Observable } from 'rxjs/Observable'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/concat'
import 'rxjs/add/observable/combineLatest'
// using `import {pick} from 'lodash'` isn't handled by the tree shaker :(
const pick = require('lodash/pick')
const groupBy = require('lodash/groupBy')
const uniqBy = require('lodash/uniqBy')
const mapValues = require('lodash/mapValues')

import { SearchTerms } from './search-terms.service'
import { MusicQueue } from '../music-queue/music-queue.service'
import { CurrentTrack } from '../current-track/current-track.service'
import { Album } from '../album'
import { Track } from '../track'
import { DestructionCallbacks } from '../destruction-callbacks'

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent extends DestructionCallbacks implements OnInit {
  private terms: string

  public searchResults: Observable<Array<Track | Album>>

  public numberOfTracksFromAlbumInQueue = this.musicQueue.tracks.map(tracks => {
    return mapValues(
      groupBy(tracks, track => track.album.id),
      groupedTracks => uniqBy(groupedTracks, 'id').length
    )
  })

  constructor(
    private searchTerms: SearchTerms,
    private route: ActivatedRoute,
    private musicQueue: MusicQueue,
    private currentTrack: CurrentTrack,
    private jsonp: Jsonp
  ) {
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
              const album = pick(track.album, ['title', 'id'])
              const artist = pick(track.artist, 'name')
              return {id, title, album, artist, duration: duration * 1000}
            })
          }),
        this.jsonp.get(`http://api.deezer.com/search/album?q=${terms}&limit=100&output=jsonp&callback=JSONP_CALLBACK`)
          .map(data => data.json().data)
          .map(results => {
            return results.map(album => {
              const {id, title, nb_tracks: nTracks} = album
              const artist = pick(album.artist, 'name')
              return {id, title, artist, nTracks}
            })
          }),
        (tracks, albums) => [ ...albums, ...tracks ]
      )
    })

    this.onDestroy(() => {
      this.searchTerms.setTerms('')
    })
  }

  private selectResult(result, play = false) {
    if (result.album) {
      this.musicQueue.appendTrack(result)
      if (play)
        this.currentTrack.play(result.id, length)
    } else {
      // TODO: move to deezer player search service
      const album = pick(result, ['title', 'id'])
      this.jsonp.get(`http://api.deezer.com/album/${result.id}/tracks?output=jsonp&callback=JSONP_CALLBACK`)
      .map(data => data.json().data)
      .map(results => {
        return results.map(track => {
          const {id, title, duration} = track
          const artist = pick(track.artist, 'name')
          return {id, title, album, artist, duration: duration * 1000}
        })
      })
      .withLatestFrom(this.musicQueue.tracks)
      .subscribe(([resultTracks, tracks]) => {
        const { length } = tracks
        let newLength = length
        resultTracks.forEach(track => { this.musicQueue.insertTrack(track, newLength++) })
        if (play) {
          this.currentTrack.play(resultTracks[0].id, length)
        }
      })
    }
  }

  private playResult(event, result) {
    event.stopPropagation()
    this.selectResult(result, true)
  }
}
