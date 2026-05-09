import { useState, useCallback } from 'react'
import { useIsClient, useWindow } from './useSSR'

export default function useEnterDirection() {
  const isClient = useIsClient()
  const windowObj = useWindow() // ✅ Add missing windowObj
  const [enterDirection, setEnterDirection] = useState<string>('')

  const calculateDirection = useCallback(
    (e: React.PointerEvent<HTMLElement>): string => {
      if (!isClient || !windowObj) return ''

      const ref = e.target as HTMLElement
      const { width, height, top, left } = ref.getBoundingClientRect()

      const l = e.pageX - (left + windowObj.pageXOffset)
      const t = e.pageY - (top + windowObj.pageYOffset)
      const xx = width > height ? height / width : 1
      const x = l - (width / 2) * xx
      const yy = height > width ? width / height : 1
      const y = t - (height / 2) * yy
      const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4

      let direction: string
      switch (d) {
        case 0:
          direction = 'top'
          break
        case 1:
          direction = 'right'
          break
        case 2:
          direction = 'bottom'
          break
        case 3:
          direction = 'left'
          break
        default:
          direction = ''
      }

      setEnterDirection(direction)
      return direction
    },
    [isClient, windowObj]
  )

  return {
    enterDirection,
    calculateDirection,
  }
}
