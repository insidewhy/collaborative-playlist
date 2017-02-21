import { Injectable } from '@angular/core'

@Injectable()
export class SelectedTracks {
  public indexes = new Set<number>()

  selected(index: number):boolean { return this.indexes.has(index) }

  toggle(index: number):void {
    if (this.indexes.has(index))
      this.indexes.delete(index)
    else
      this.indexes.add(index)
  }

  clear() { this.indexes.clear() }
}
