export class TrackState {
  // now minus duration elapsed, not the time the song was actually started
  private beginTime? = new Date()

  // when more than 0 then the elapsed time at which the track is paused in ms
  private pausedAt = 0

  // index within musicQueue of current playing track, -1 = no queued track
  public index = -1

  public get paused() { return this.pausedAt !== 0 }

  public getElapsed(): number {
    return this.pausedAt || Date.now() - this.beginTime.getTime()
  }

  public pause(): void {
    if (! this.pausedAt)
      this.pausedAt = this.getElapsed()
  }

  // play track at index from beginning, remove paused status if it is set
  public play(): void {
    this.beginTime = new Date()
    if (this.index === -1) {
      this.pausedAt = 0
      return
    }

    const { pausedAt } = this
    if (pausedAt) {
      // when resuming from pause the begin time needs adjusting
      this.beginTime.setTime(this.beginTime.getTime() - pausedAt)
      this.pausedAt = 0
    }
  }
}
