import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useCallback,
} from 'react'
import useLocalStorage from '../hooks/useStorage'
import { ELanguages } from '../types'
import {
  translations,
  TranslationKey,
  TranslationLang,
} from '../i18n/translations'
import { useIsClient } from '../hooks/useSSR'

interface LanguageContextProps {
  language: ELanguages
  setLanguage: (lang: ELanguages) => void
  t: (key: TranslationKey) => string
}

export const LanguageContext = createContext<LanguageContextProps | null>(null)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const isClient = useIsClient()
  const [language, setLanguageRaw] = useLocalStorage<ELanguages>(
    'AppLanguage',
    ELanguages.en
  )

  // Remove only the 'lang' query param when present, keep others
  const setLanguage = useCallback(
    (lang: ELanguages) => {
      setLanguageRaw(lang)

      if (isClient && typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href)
          if (url.searchParams.has('lang')) {
            url.searchParams.delete('lang')
            const newSearch = url.searchParams.toString()
            const newUrl =
              url.pathname + (newSearch ? `?${newSearch}` : '') + url.hash
            window.history.replaceState({}, '', newUrl)
          }
        } catch (error) {
          console.warn('Failed to update URL:', error)
        }
      }
    },
    [setLanguageRaw, isClient]
  )

  const t = useCallback(
    (key: TranslationKey) => {
      if (!translations[key]) {
        console.error(`Translation value "${key}" not found`)
        return key
      } else if (!translations[key][language as TranslationLang]) {
        console.error(
          `Translation value "${key}" not found in language "${language}"`
        )
        if (translations[key].en) {
          return translations[key].en
        } else return key
      } else {
        return translations[key][language as TranslationLang]
      }
    },
    [language]
  )

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)

  if (context === null) {
    // During SSR or if provider is missing, return safe defaults
    return {
      language: ELanguages.en,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setLanguage: () => {},
      t: (key: TranslationKey) => key, // Return key as fallback
    }
  }

  return context
}

// import { createContext, FC, ReactNode } from 'react'
// import useLocalStorage from '../hooks/useStorage'
// import { ELanguages, TranslationKey, TranslationLang, translations } from '../types'

// interface LanguageContextProps {
//   language: ELanguages
//   setLanguage: (lang: ELanguages) => void
//   t: (key: TranslationKey) => string
// }

// export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

// export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {

//   const [language, setLanguageRaw] = useLocalStorage<ELanguages>(
//     'AppLanguage',
//     ELanguages.en
//   )

//   // Remove only the 'lang' query param when present, keep others
//   const setLanguage = (lang: ELanguages) => {
//     setLanguageRaw(lang);
//     const url = new URL(window.location.href);
//     if (url.searchParams.has('lang')) {
//       url.searchParams.delete('lang');
//       const newSearch = url.searchParams.toString();
//       const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '') + url.hash;
//       window.history.replaceState({}, '', newUrl);
//     }
//   }

//   const t = (key: TranslationKey) => {
//     if (!translations[key]) {
//       console.error(`Translation value "${key}" not found`)
//       return key
//     } else if (!translations[key][language as TranslationLang]) {
//       console.error(`Translation value "${key}" not found in language "${language}"`)
//       if (translations[key]['en']) {
//         return translations[key]['en']
//       } else return key
//     } else {
//       return translations[key][language as TranslationLang]
//     }
//   }

//   return (
//     <LanguageContext.Provider value={{ language, setLanguage, t }}>
//       {children}
//     </LanguageContext.Provider>
//   )
// }
