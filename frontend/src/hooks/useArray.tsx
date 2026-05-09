import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default function useArray<T extends {}>(defaultValue: T[]) {
  //NOTE: Typechecking only works for arrays with content of the same type

  const [array, setArray] = useState(defaultValue)

  function push(element: T) {
    setArray(a => [...a, element])
  }

  function filter(callback: (n: T) => boolean) {
    setArray(a => a.filter(callback))
  }

  function update(index: number, newElement: T) {
    setArray(a => [
      ...a.slice(0, index),
      newElement,
      ...a.slice(index + 1, a.length),
    ])
  }

  function remove(index: number) {
    setArray(a => [...a.slice(0, index), ...a.slice(index + 1, a.length)])
  }

  function clear() {
    setArray([])
  }

  return { array, set: setArray, push, filter, update, remove, clear }
}
