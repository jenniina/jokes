import React, { useEffect, useState } from 'react'
import { useIsClient, useWindow } from '../hooks/useSSR'

export default function useIsOnScreen(
  ref: React.MutableRefObject<HTMLElement | null>,
  rootMargin = '0px',
  threshold = 0.0
) {
  const isClient = useIsClient()
  const windowObj = useWindow()

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isClient || !windowObj || ref.current == null) return
    const element = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin, threshold }
    )
    observer.observe(element)
    return () => {
      observer.unobserve(element)
    }
  }, [isClient, windowObj, ref, rootMargin, threshold])

  return isVisible
}
