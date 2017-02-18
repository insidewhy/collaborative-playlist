function objOnDestroy(obj, callback) {
  const {__destroyCallbacks} = obj
  if (! __destroyCallbacks)
    obj.__destroyCallbacks = []

  obj.__destroyCallbacks.push(callback)
}

export function onDestroy(obj: any, callback: Function) {
  obj.onDestroy(callback)
}

export function OnDestroy() {
  return klass => {
    klass.prototype.onDestroy = function(callback) { objOnDestroy(this, callback) }

    klass.prototype.ngOnDestroy = function() {
      const {__destroyCallbacks} = this
      if (! __destroyCallbacks)
        return
      __destroyCallbacks.forEach(callback => callback.apply(this))
      __destroyCallbacks.length = 0
    }

    return klass
  }
}
