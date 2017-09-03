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

  constructor(
    private searchTerms: SearchTerms,
    private route: ActivatedRoute,
    private musicQueue: MusicQueue,
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

  public get numberOfTracksFromAlbumInQueue() {
    return this.musicQueue.tracks.map(tracks => {
      return mapValues(
        groupBy(tracks, track => track.album.id),
        groupedTracks => uniqBy(groupedTracks, 'id').length
      )
    })
  }

  private selectResult(result, play = false) {
    if (result.album) {
      const { length } = this.musicQueue.tracks.getValue()
      this.musicQueue.insertTrack(result, length)
      if (play) {
        this.musicQueue.playTrack(result.id, length)
      }
    } else {
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
      .subscribe(tracks => {
        const { length } = this.musicQueue.tracks.getValue()
        let newLength = length
        tracks.forEach(track => { this.musicQueue.insertTrack(track, newLength++) })
        if (play) {
          this.musicQueue.playTrack(tracks[0].id, length)
        }
      })
    }
  }

  private playResult(event, result) {
    event.stopPropagation()
    this.selectResult(result, true)
  }
}
