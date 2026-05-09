import { useState, useCallback } from 'react'

interface TooltipState {
  visible: boolean
  x: number
  y: number
}

interface UseTooltipReturn {
  tooltip: TooltipState
  handleMouseMove: (x: number, y: number) => void
  handleMouseLeave: () => void
}

const useTooltip = (): UseTooltipReturn => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
  })

  const handleMouseMove = useCallback((x: number, y: number) => {
    setTooltip({
      visible: true,
      x,
      y,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({
      ...prev,
      visible: false,
    }))
  }, [])

  return { tooltip, handleMouseMove, handleMouseLeave }
}

export default useTooltip
