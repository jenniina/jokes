import { ReactNode } from 'react'
import { IJoke } from '../components/Jokes/types'

export interface RefObject<T> {
  readonly current: T | null
}

export const breakpoint = 700
export const breakpointSmall = 400

export interface AppProps {
  // pageContext is provided during server render by +onRenderHtml
  pageContext: {
    urlPathname?: string | undefined
  }
}

export interface IContent {
  success: boolean
  user: IUser
  message: string
}

export interface IResponse {
  success: boolean
  message: string
}

export interface IToken extends IResponse {
  token?: string
}

export interface credentials {
  username: string
  password: string
  language: string
}

export interface IUser {
  _id?: string
  username: string
  name?: string
  role?: number
  password: string
  passwordOld?: string
  language: ELanguages | string
  verified?: boolean
  createdAt?: string
  updatedAt?: string
  blacklistedJokes?: IBlacklistedJoke[]
  colorAccessibility?: {
    colors: unknown[]
    currentColor?: string
    mode?: string
    updatedAt?: string
  }
}

export interface IPublicUserName {
  _id: string
  name: string
}

export type TPublicUserNamesMap = Record<string, string>

export interface IBlacklistedJoke {
  jokeId: IJoke['jokeId']
  language: ELanguages
  value?: string
  _id?: string
}

export interface ReducerProps {
  jokes: {
    jokes: IJoke[]
    joke: IJoke | null
  }
  notification: {
    isError: boolean
    message: string
    seconds: number
  }
  users: IUser[]
  auth: {
    user: IUser
    isAuthenticated: boolean
    isLoading: boolean
    token: string
  }
}

export interface ModalProps {
  children: ReactNode
  className: string
  title: string
}

export type TSortDirection = 'asc' | 'desc'

export enum ELanguages {
  en = 'en',
  fi = 'fi',
  es = 'es',
  fr = 'fr',
  de = 'de',
  pt = 'pt',
  cs = 'cs',
}
export enum ELanguagesLong {
  en = 'English',
  fi = 'Suomi',
  es = 'Español',
  fr = 'Français',
  de = 'Deutch',
  pt = 'Português',
  cs = 'Čeština',
}
export enum ELanguageTitle {
  en = 'Language',
  es = 'Idioma',
  fr = 'Langue',
  de = 'Sprache',
  pt = 'Língua',
  cs = 'Jazyk',
  fi = 'Kieli',
}

export type EGeneric<T> = {
  [key in keyof T]: T[key]
}

export const LanguageOfLanguage: ILanguageOfLanguage = {
  en: {
    English: 'English',
    Español: 'Spanish',
    Français: 'French',
    Deutch: 'German',
    Português: 'Portuguese',
    Čeština: 'Czech',
    Suomi: 'Finnish',
  },
  es: {
    English: 'Inglés',
    Español: 'Español',
    Français: 'Francés',
    Deutch: 'Alemán',
    Português: 'Portugués',
    Čeština: 'Checo',
    Suomi: 'Finlandés',
  },
  fr: {
    English: 'Anglais',
    Español: 'Espagnol',
    Français: 'Français',
    Deutch: 'Allemand',
    Português: 'Portugais',
    Čeština: 'Tchèque',
    Suomi: 'Finnois',
  },
  de: {
    English: 'Englisch',
    Español: 'Spanisch',
    Français: 'Französisch',
    Deutch: 'Deutsch',
    Português: 'Portugiesisch',
    Čeština: 'Tschechisch',
    Suomi: 'Finnisch',
  },
  pt: {
    English: 'Inglês',
    Español: 'Espanhol',
    Français: 'Francês',
    Deutch: 'Alemão',
    Português: 'Português',
    Čeština: 'Tcheco',
    Suomi: 'Finlandês',
  },
  cs: {
    English: 'Angličtina',
    Español: 'Španělština',
    Français: 'Francouzština',
    Deutch: 'Němčina',
    Português: 'Portugalština',
    Čeština: 'Čeština',
    Suomi: 'Finština',
  },
  fi: {
    English: 'Englanti',
    Español: 'Espanja',
    Français: 'Ranska',
    Deutch: 'Saksa',
    Português: 'Portugali',
    Čeština: 'Tšekki',
    Suomi: 'Suomi',
  },
}

export interface ILanguageOfLanguage {
  en: {
    English: 'English'
    Español: 'Spanish'
    Français: 'French'
    Deutch: 'German'
    Português: 'Portuguese'
    Čeština: 'Czech'
    Suomi: 'Finnish'
  }
  es: {
    English: 'Inglés'
    Español: 'Español'
    Français: 'Francés'
    Deutch: 'Alemán'
    Português: 'Portugués'
    Čeština: 'Checo'
    Suomi: 'Finlandés'
  }
  fr: {
    English: 'Anglais'
    Español: 'Espagnol'
    Français: 'Français'
    Deutch: 'Allemand'
    Português: 'Portugais'
    Čeština: 'Tchèque'
    Suomi: 'Finnois'
  }
  de: {
    English: 'Englisch'
    Español: 'Spanisch'
    Français: 'Französisch'
    Deutch: 'Deutsch'
    Português: 'Portugiesisch'
    Čeština: 'Tschechisch'
    Suomi: 'Finnisch'
  }
  pt: {
    English: 'Inglês'
    Español: 'Espanhol'
    Français: 'Francês'
    Deutch: 'Alemão'
    Português: 'Português'
    Čeština: 'Tcheco'
    Suomi: 'Finlandês'
  }
  cs: {
    English: 'Angličtina'
    Español: 'Španělština'
    Français: 'Francouzština'
    Deutch: 'Němčina'
    Português: 'Portugalština'
    Čeština: 'Čeština'
    Suomi: 'Finština'
  }
  fi: {
    English: 'Englanti'
    Español: 'Espanja'
    Français: 'Ranska'
    Deutch: 'Saksa'
    Português: 'Portugali'
    Čeština: 'Tšekki'
    Suomi: 'Suomi'
  }
}

export enum ELanguageOfLanguage_en {
  English = 'English',
  Español = 'Spanish',
  Français = 'French',
  Deutch = 'German',
  Português = 'Portuguese',
  Čeština = 'Czech',
  Suomi = 'Finnish',
}
export enum ELanguageOfLanguage_es {
  English = 'Inglés',
  Español = 'Español',
  Français = 'Francés',
  Deutch = 'Alemán',
  Português = 'Portugués',
  Čeština = 'Checo',
  Suomi = 'Finlandés',
}
export enum ELanguageOfLanguage_fr {
  English = 'Anglais',
  Español = 'Espagnol',
  Français = 'Français',
  Deutch = 'Allemand',
  Português = 'Portugais',
  Čeština = 'Tchèque',
  Suomi = 'Finnois',
}
export enum ELanguageOfLanguage_de {
  English = 'Englisch',
  Español = 'Spanisch',
  Français = 'Französisch',
  Deutch = 'Deutsch',
  Português = 'Portugiesisch',
  Čeština = 'Tschechisch',
  Suomi = 'Finnisch',
}
export enum ELanguageOfLanguage_pt {
  English = 'Inglês',
  Español = 'Espanhol',
  Français = 'Francês',
  Deutch = 'Alemão',
  Português = 'Português',
  Čeština = 'Tcheco',
  Suomi = 'Finlandês',
}
export enum ELanguageOfLanguage_cs {
  English = 'Angličtina',
  Español = 'Španělština',
  Français = 'Francouzština',
  Deutch = 'Němčina',
  Português = 'Portugalština',
  Čeština = 'Čeština',
  Suomi = 'Finština',
}
export enum ELanguageOfLanguage_fi {
  English = 'Englanti',
  Español = 'Espanja',
  Français = 'Ranska',
  Deutch = 'Saksa',
  Português = 'Portugali',
  Čeština = 'Tšekki',
  Suomi = 'Suomi',
}
export interface ELanguageOfLanguage {
  en: ELanguageOfLanguage_en
  es: ELanguageOfLanguage_es
  fr: ELanguageOfLanguage_fr
  de: ELanguageOfLanguage_de
  pt: ELanguageOfLanguage_pt
  cs: ELanguageOfLanguage_cs
  fi: ELanguageOfLanguage_fi
}
