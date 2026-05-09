// Client-only utils that use translations
// These are separated to prevent bundling translations in server chunks

import { ELanguages } from '../types'
import { firstToUpperCase } from '.'
import {
  translations as t,
  TranslationKey,
  TranslationLang,
} from '../i18n/translations'
import { SelectOption } from '../components/Select/Select'

export const first3Words = (name: string, language: ELanguages): string => {
  // if name is less than 5 words, return the name
  if (name.split(' ').length <= 4) return name
  // else return the first 3 words
  else return name.split(' ').slice(0, 3).join(' ') + ' ' + t.Etc[language]
}

export function createSelectOptionsFromT(
  array: string[],
  language: ELanguages
): SelectOption[] {
  return array.map((key) => {
    const formattedKey = firstToUpperCase(key)
    return {
      value: key,
      label: t[formattedKey as TranslationKey]
        ? t[formattedKey as TranslationKey][language as TranslationLang]
        : key,
    }
  })
}
