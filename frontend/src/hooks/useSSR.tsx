import { useCallback, useEffect, useState } from 'react'

export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  const handleIsClient = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const t = window.setTimeout(() => setIsClient(true), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    return handleIsClient()
  }, [handleIsClient])

  return isClient
}

export function useWindow() {
  const [windowObj, setWindowObj] = useState<Window | null>(null)

  const handleSetWindowObj = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const t = window.setTimeout(() => setWindowObj(window), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    return handleSetWindowObj()
  }, [handleSetWindowObj])

  return windowObj
}
