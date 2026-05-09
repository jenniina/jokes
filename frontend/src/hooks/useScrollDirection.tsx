import { useEffect, useState } from 'react'
import { useIsClient, useWindow } from './useSSR'

export default function useScrollDirection() {
  const isClient = useIsClient()
  const windowObj = useWindow()

  const [scrollDirection, setScrollDirection] = useState('up')

  useEffect(() => {
    let lastScrollY = windowObj ? windowObj.pageYOffset : 0

    const updateScrollDirection = () => {
      const scrollY = windowObj ? windowObj.pageYOffset : 0
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 4 || scrollY - lastScrollY < -4)
      ) {
        setScrollDirection(direction)
      }
      lastScrollY = scrollY > 0 ? scrollY : 0
    }
    if (!isClient || !windowObj) return
    windowObj.addEventListener('scroll', updateScrollDirection)
    return () => {
      windowObj.removeEventListener('scroll', updateScrollDirection)
    }
  }, [scrollDirection, isClient, windowObj])

  return scrollDirection
}
