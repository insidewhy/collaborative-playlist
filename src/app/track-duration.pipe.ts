import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'trackDuration' })
export class TrackDurationPipe implements PipeTransform {
  transform(value: number): string {
    const totalSeconds = value / 1000
    const seconds = totalSeconds % 60
    const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString()

    return Math.floor(totalSeconds / 60) + ':' + secondsStr
  }
}
