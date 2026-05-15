import { useState, useEffect, useCallback, useRef } from 'react'

type Precision = '1s' | '1ms'

const useTimer = (active: boolean, precision: Precision) => {
  const [timerState, setTimerState] = useState<{
    precision: Precision
    timer: number
  }>({ precision, timer: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timer = timerState.precision === precision ? timerState.timer : 0

  const resetTimer = useCallback(() => {
    setTimerState({ precision, timer: 0 })
  }, [precision])

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
      setTimerState((prev) => {
        const previousTimer = prev.precision === precision ? prev.timer : 0
        const updatedTimer = previousTimer + increment

        return {
          precision,
          timer:
            precision === '1s'
              ? updatedTimer
              : parseFloat(updatedTimer.toFixed(1)),
        }
      })
    }, intervalDuration)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [active, precision])

  return { timer, resetTimer }
}

export default useTimer
