export class TrackState {
  // time track was resumed/played, null if paused
  public started? = new Date()

  // when more than 0 then the elapsed time at which the track is paused
  public pausedAt = 0

  // index within musicQueue of current playing track, -1 = no queued track
  public index = -1

  public getElapsed(): number {
    return (Date.now() - this.started.getTime()) / 1000
  }

  public pause() {
    this.pausedAt = this.getElapsed()
  }

  // play track at index from beginning, remove paused status if it is set
  public play() {
    this.pausedAt = 0
    this.started = new Date()
  }
}
