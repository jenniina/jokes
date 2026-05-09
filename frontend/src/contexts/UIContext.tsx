import React, {
  createContext,
  useState,
  useEffect,
  FC,
  Dispatch,
  SetStateAction,
  ReactNode,
  useCallback,
} from 'react'
import { isTouchDevice } from '../hooks/useDraggable'
import { useTheme } from '../hooks/useTheme'
import { useScrollbarWidth } from '../hooks/useScrollbarWidth'
import { RefObject } from '../types'
import { useLanguageContext } from './LanguageContext'

interface UIContextProps {
  menuStyleAltTransform: boolean
  setMenuStyleAltTransform: Dispatch<SetStateAction<boolean>>
  touchDevice: boolean
  lightTheme: boolean
}

export const UIContext = createContext<UIContextProps | undefined>(undefined)

export const UIProvider: FC<{
  menuStyle: RefObject<{ getStyle: () => boolean }>
  children: ReactNode
}> = ({ menuStyle, children }) => {
  const { language } = useLanguageContext()

  const [menuStyleAltTransform, setMenuStyleAltTransform] = useState(false)
  const touchDevice = isTouchDevice()
  const lightTheme = useTheme()
  const scrollbarWidth = useScrollbarWidth()
  const styleInnerWrap: React.CSSProperties = {
    ['--scrollbar_width' as string]: `${scrollbarWidth}px`,
  }

  // Update menuStyleAltTransform when lightTheme changes
  const handleLightThemeChange = useCallback(() => {
    // Schedule state updates asynchronously to avoid synchronous setState in an effect
    const t1 = window.setTimeout(() => setMenuStyleAltTransform(false), 0)
    const t2 = window.setTimeout(() => setMenuStyleAltTransform(true), 300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    // Call the callback and return its cleanup so timers are cleared on unmount / deps change
    return handleLightThemeChange()
  }, [lightTheme, handleLightThemeChange])

  //So transformations don't take place when changing menu style or toggling light/dark mode:
  const handleMenuStyleChange = useCallback(() => {
    // Schedule the two state changes so they're not synchronous inside the effect
    const t1 = window.setTimeout(() => setMenuStyleAltTransform(false), 0)
    const t2 = window.setTimeout(() => setMenuStyleAltTransform(true), 300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [menuStyle.current]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Ensure the returned cleanup from the callback is registered with the effect
    return handleMenuStyleChange()
  }, [handleMenuStyleChange])

  return (
    <UIContext.Provider
      value={{
        menuStyleAltTransform,
        setMenuStyleAltTransform,
        touchDevice,
        lightTheme,
      }}
    >
      <div
        className={`App ${lightTheme ? 'light' : ''} ${
          touchDevice ? 'touch' : ''
        }  ${menuStyleAltTransform ? `transformations` : ''} ${language}`}
      >
        <div className="App-inner-wrap" style={styleInnerWrap}>
          {children}
        </div>
      </div>
    </UIContext.Provider>
  )
}
