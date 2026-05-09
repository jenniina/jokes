import { useCallback, useState } from 'react'

export default function useNoTransitionFlag() {
  const [noTransition, setNoTransition] = useState(false)
  const arm = useCallback(() => {
    setNoTransition(true) // frame #1: disable transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // frame #3: re-enable
        setNoTransition(false)
      })
    })
  }, [])
  return { noTransition, arm }
}
