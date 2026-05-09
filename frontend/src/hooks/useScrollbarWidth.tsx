import { useEffect, useState } from 'react'

export const useScrollbarWidth = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const measureScrollbarWidth = () => {
      const outer = document.createElement('div')
      outer.style.visibility = 'hidden'
      outer.style.overflow = 'scroll'
      outer.style.setProperty('msOverflowStyle', 'scrollbar')

      document.body.appendChild(outer)

      const inner = document.createElement('div')
      outer.appendChild(inner)

      const nextWidth = outer.offsetWidth - inner.offsetWidth
      outer.parentNode?.removeChild(outer)
      setScrollbarWidth(nextWidth)
    }

    measureScrollbarWidth()
    window.addEventListener('resize', measureScrollbarWidth)

    return () => {
      window.removeEventListener('resize', measureScrollbarWidth)
    }
  }, [])

  return scrollbarWidth
}
