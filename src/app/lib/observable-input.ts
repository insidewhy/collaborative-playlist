import { Input } from '@angular/core'

export function ObservableInput(name = undefined) {
  return (target, propertyKey) => {
    const setterName = 'set__' + propertyKey
    Object.defineProperty(target, setterName, {
      set(value) {
        this[propertyKey].next(value)
      }
    })
    target.setterName = Input(name || propertyKey)(target, setterName)
  }
}
