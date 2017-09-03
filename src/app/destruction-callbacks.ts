import { OnDestroy } from '@angular/core'

type Constructor<T> = new(...args: any[]) => T

function onDestroyHelper(obj, callback: Function) {
  if (! obj.__destroyCallbacks)
    obj.__destroyCallbacks = []
  obj.__destroyCallbacks.push(callback)
}

function ngOnDestroyHelper(obj): void {
  const {__destroyCallbacks} = obj
  if (! __destroyCallbacks)
    return
  __destroyCallbacks.forEach(callback => callback.apply(obj))
  __destroyCallbacks.length = 0
}

export function DestructionCallbacksMixin<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    private __destroyCallbacks: Function[]

    constructor(...args: any[]) {
      super(...args)
      this.__destroyCallbacks = []

      this.onDestroy = onDestroyHelper.bind(null, this)
      this.ngOnDestroy = ngOnDestroyHelper.bind(null, this)
    }

    declare onDestroy(callback: Function): void
    declare ngOnDestroy()
  }
}

export class DestructionCallbacks implements OnDestroy {
  onDestroy(callback: Function): void { onDestroyHelper(this, callback) }
  ngOnDestroy() { ngOnDestroyHelper(this) }
}
