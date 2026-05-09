import { useState, useEffect } from 'react'

const preventDefault = (e: Event) => {
  e.preventDefault()
}

function useDisableScroll() {
  const [scrollDisabled, setScrollDisabled] = useState(false)

  useEffect(() => {
    if (scrollDisabled) {
      document?.addEventListener('touchmove', preventDefault, {
        passive: false,
      })
      if (document) document.body.style.overflow = 'hidden'
    } else {
      if (document) document.body.style.overflowY = 'auto'
      if (document) document.body.style.overflowX = 'hidden'
      document?.removeEventListener('touchmove', preventDefault)
    }

    return () => {
      if (document) document.body.style.overflowY = 'auto'
      if (document) document.body.style.overflowX = 'hidden'
      document?.removeEventListener('touchmove', preventDefault)
    }
  }, [scrollDisabled])

  function disableScroll() {
    setScrollDisabled(!scrollDisabled)
  }

  return disableScroll
}

export default useDisableScroll
