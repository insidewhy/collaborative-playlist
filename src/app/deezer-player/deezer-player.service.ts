import { Injectable } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import 'rxjs/add/observable/empty'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/shareReplay'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/withLatestFrom'

import { Source } from '../source'
import { MusicQueue } from '../music-queue/music-queue.service'
import { CurrentTrack } from '../current-track/current-track.service'
import { PlayerControls } from '../player-controls/player-controls.service'

declare var DZ: any

const acceptableLag = 1000

interface Events {
  play: Observable<any>
  trackEnd: Observable<any>
}

const fromDZEvent = (eventName: string) => new Observable<any>(observer => {
  DZ.Event.subscribe(eventName, event => { observer.next(event) })
})

@Injectable()
export class DeezerPlayer extends Source {
  private activated$ = this.playerControls.muted.map(val => ! val)
  public activated = this.activated$.startWith(true).distinctUntilChanged()

  private load = new Observable<Events>(observer => {
    // DZ.Event.subscribe('player_play', this.onPlay.bind(this))

    DZ.init({
      appId: '225524',
      channelUrl: window.location + '/assets/channel.html',

      player: {
        onload(dzState) {
          observer.next({
            play: fromDZEvent('player_play'),
            trackEnd: fromDZEvent('track_end'),
          })
        }
      },
    })
  }).take(1).shareReplay(1)

  constructor(
    private musicQueue: MusicQueue,
    private currentTrack: CurrentTrack,
    private playerControls: PlayerControls,
  ) {
    super()

    this.reactTo(this.activated$, activated => {
      if (! activated)
        DZ.player.pause()
    })

    const events$ = this.activated.switchMap(
      activated => activated ? this.load : Observable.empty<Events>()
    ).share()

    this.reactTo(
      events$
        .switchMap(events => events.trackEnd)
        .withLatestFrom(this.currentTrack.index, this.musicQueue.tracks),

      ([end, index, tracks]) => {
        // console.log('track end', end, index, tracks)
        const nextIdx = index + 1
        const track = tracks[nextIdx]
        if (track)
          this.currentTrack.play(track.id, nextIdx)
        else
          this.currentTrack.play(null, -1)
      }
    )

    this.reactTo(
      events$.switchMap(events => events.play)
        .withLatestFrom(this.currentTrack.elapsed, this.currentTrack.track)
        .distinctUntilChanged(([, aElapsed ], [, bElapsed ]) => aElapsed === bElapsed),

      ([, elapsed, track]) => {
        // console.log('seek', elapsed, track.duration, (elapsed / track.duration) * 100)
        if (elapsed > 0)
          DZ.player.seek((elapsed / track.duration) * 100)
      }
    )

    this.reactTo(
      Observable.combineLatest(
        this.currentTrack.status,
        this.currentTrack.track,
        // here just to ensure deezer has loaded
        events$.take(1),
        (status, track) => ({ ...status, track })
      ).scan(
        (acc, status) => {
          const { elapsed: prevElapsed, trackIdx: playingTrackIdx, paused: prevPaused } = acc
          return { ...status, prevElapsed, playingTrackIdx, prevPaused }
        },
        { elapsed: -1, trackIdx: -1, paused: true }
      ),

      ({ trackIdx, prevElapsed, playingTrackIdx, elapsed, paused, prevPaused, track }) => {
        if (! track || paused) {
          DZ.player.pause()
          return
        }

        if (track) {
          const { id: trackId } = track

          if (! prevPaused && trackIdx === playingTrackIdx) {
            // TODO: improve this by measuring initial lag etc.
            // avoid replaying when incrementing time etc.
            if (elapsed >= prevElapsed && elapsed <= prevElapsed + acceptableLag)
              return
          }

          DZ.player.playTracks([ trackId ])
          // this.seekOnNext = (elapsed / track.duration) * 100
        }
      }
    )
  }
}
