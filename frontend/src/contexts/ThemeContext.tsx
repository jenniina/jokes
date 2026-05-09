import { createContext, useEffect, EffectCallback, ReactNode } from 'react'
import useLocalStorage from '../hooks/useStorage'
import { useIsClient, useWindow } from '../hooks/useSSR'

export const ThemeContext = createContext(true)
export const ThemeUpdateContext = createContext<EffectCallback | undefined>(
  undefined
)

interface Props {
  children: ReactNode
}

export function ThemeProvider({ children }: Props) {
  const isClient = useIsClient()
  const windowObj = useWindow()
  const [prefersLight, setPrefersLight] = useLocalStorage('prefersLight', true)

  useEffect(() => {
    if (!isClient || !windowObj) return
    const mediaQuery = windowObj.matchMedia('(prefers-color-scheme: light)')
    setPrefersLight(mediaQuery.matches)
    mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
      setPrefersLight(e.matches)
    })
  }, [isClient, windowObj, setPrefersLight])

  const [lightTheme, setLightTheme] = useLocalStorage(
    `useLightMode`,
    prefersLight ? true : false
  )

  // Read the ?light query parameter and update theme
  useEffect(() => {
    if (!isClient || !windowObj) return
    const params = new URLSearchParams(windowObj.location.search)
    const lightParam = params.get('light')
    if (lightParam !== null) {
      setLightTheme(lightParam === 'true')
    }
  }, [setLightTheme, isClient, windowObj])

  const lightEnabled = lightTheme ?? prefersLight

  function toggleTheme() {
    setLightTheme((prevTheme) => !prevTheme)
  }

  useEffect(() => {
    /*add 'light' class to body when lightEnabled is true*/
    if (!isClient || typeof document === 'undefined') return

    document?.body.classList.toggle('light', lightEnabled)
  }, [lightEnabled, isClient])

  return (
    <ThemeContext.Provider value={lightTheme}>
      <ThemeUpdateContext.Provider value={toggleTheme}>
        {children}
      </ThemeUpdateContext.Provider>
    </ThemeContext.Provider>
  )
}
