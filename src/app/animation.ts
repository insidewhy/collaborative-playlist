export default class Animation {
  private running = true
  constructor(public callback, public rate = 1) {
    this.start()
  }

  start() {
    let rateIdx = 0
    const nextFrame = () => {
      if (! this.running)
        return
      if (++rateIdx % this.rate === 0) {
        this.callback()
      }
      window.requestAnimationFrame(nextFrame)
    }
    nextFrame()
  }

  stop() {
    this.running = false
  }
}
