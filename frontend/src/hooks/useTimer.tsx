import { useState, useEffect, useCallback, useRef } from 'react'

type Precision = '1s' | '1ms'

const useTimer = (active: boolean, precision: Precision) => {
  const [timer, setTimer] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = useCallback(() => {
    setTimer(0)
  }, [])

  // Handle timer logic - start interval when active
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Don't start interval if not active
    if (!active) {
      return
    }

    const intervalDuration = precision === '1s' ? 1000 : 100 // milliseconds
    const increment = precision === '1s' ? 1 : 0.1

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        const updatedTimer = prev + increment
        return precision === '1s'
          ? updatedTimer
          : parseFloat(updatedTimer.toFixed(1))
      })
    }, intervalDuration)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [active, precision])

  // Reset timer when precision changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimer(0)
  }, [precision])

  return { timer, resetTimer }
}

export default useTimer
