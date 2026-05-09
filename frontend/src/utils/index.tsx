import { Fragment } from 'react'
import { ELanguages, ELanguagesLong } from '../types'
import { SelectOption } from '../components/Select/Select'
import {
  ECategories,
  EJokeType,
  ESafemode,
  TCategoryByLanguages,
} from '../components/Jokes/types'

export function getRandomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export const splitToLines = (details: string) => {
  return details.split('\n').map((line: string, index: number) => (
    <Fragment key={`${line}-${index}`}>
      {line}
      <br />
    </Fragment>
  ))
}
export const firstToLowerCase = (str: string) => {
  if (!str) return str
  return str.charAt(0).toLowerCase() + str.slice(1)
}
export const firstToUpperCase = (str: string) => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const sanitize = (name: string = getRandomString(9)): string => {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '-')
}

// Note: first3Words moved to utils/translations.tsx (client-only, uses translations)

export const options = (enumObj: typeof ELanguagesLong) => {
  return Object.keys(enumObj).map((key) => ({
    value: key,
    label: enumObj[key as keyof typeof enumObj],
  })) as SelectOption[]
}

export const getRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
export const getRandomLetters = (length: number, capitals = false) => {
  const lettersAll = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const lettersCapital = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const characters = capitals ? lettersCapital : lettersAll
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
export const getRandomMinMax = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

type ScrollLogicalPosition = 'center' | 'end' | 'nearest' | 'start'

export const scrollIntoView = (
  id: string,
  block: ScrollLogicalPosition = 'start',
  inline: ScrollLogicalPosition = 'nearest'
) => {
  const element = document?.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block, inline })
  }
}

export const RandomRGBvalue = () => {
  return Math.floor(Math.random() * 256)
}

export const randomUpTo100 = () => {
  const value = Math.ceil(getRandomBetween(30, 100))
  return clampValue(30, value, 100)
}
export const randomUpTo90 = () => {
  const value = Math.ceil(getRandomBetween(5, 90))
  return clampValue(5, value, 90)
}
export const randomHSLColor = (type = 'array') => {
  const randomOneOrTwo = Math.random() < 0.5 ? 1 : 2
  if (type === 'hsl') {
    const h = Math.floor(Math.random() * 360)
    const s = randomUpTo100()
    const l = randomUpTo90()
    return `hsl(${h}, ${s}%, ${l}%)`
  } else {
    const h = Math.floor(Math.random() * 360)
    const s = randomUpTo100()
    const l = randomOneOrTwo === 1 ? 5 : 85
    return [h, s, l]
  }
}

export function clampValue(min: number, val: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export function createSelectOptions(
  enums: Record<ELanguages, string>[],
  language: ELanguages
): SelectOption[] {
  return enums.map((enumObj) => {
    const label = enumObj[language]
    return { label, value: label }
  })
}

// Note: createSelectOptionsFromT moved to utils/translations.tsx (client-only, uses translations)

export const rgbToHex = (r: number, g: number, b: number) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`
}

export const rgbToHSL = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(Math.min(s * 100, 100)),
    l: Math.round(l * 100),
  }
}

export const hslToRGB = (h: number, s: number, l: number) => {
  h /= 360
  s /= 100
  l /= 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(Math.min(r * 255, 255)),
    g: Math.round(Math.min(g * 255, 255)),
    b: Math.round(Math.min(b * 255, 255)),
  }
}

// Return a human readable message (safely) from an unknown error.
// Prefer axios.isAxiosError to detect axios errors and then look for a
// `response.data.message` property if present. Otherwise fall back to Error
// messages or a string coercion.
import { AxiosError, isAxiosError } from 'axios'
export function getErrorMessage(err: unknown, fallback: string): string {
  try {
    if (isAxiosError(err)) {
      const axiosErr = err as AxiosError<unknown>
      const data = axiosErr.response?.data
      if (data && typeof data === 'object' && 'message' in data) {
        const d = data as Record<string, unknown>
        if (typeof d.message === 'string') return d.message
      }
      return axiosErr.message ?? fallback ?? 'Unknown error'
    }
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return fallback ?? 'Unknown error'
  } catch {
    // Defensive catch: don't let a helper throw and break error handling
    return fallback ?? 'Unknown error'
  }
}

export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hk = h / 360
    r = hue2rgb(p, q, hk + 1 / 3)
    g = hue2rgb(p, q, hk)
    b = hue2rgb(p, q, hk - 1 / 3)
  }

  return rgbToHex(
    Math.round(Math.min(r * 255, 255)),
    Math.round(Math.min(g * 255, 255)),
    Math.round(Math.min(b * 255, 255))
  )
}

export const getContrastRatio = (lum1: number, lum2: number) => {
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function elementsOverlap(element1: HTMLElement, element2: HTMLElement) {
  const domRect1 = element1.getBoundingClientRect()
  const domRect2 = element2.getBoundingClientRect()

  return !(
    domRect1.top + 5 > domRect2.bottom - 5 ||
    domRect1.right < domRect2.left ||
    domRect1.bottom - 5 < domRect2.top + 5 ||
    domRect1.left > domRect2.right
  )
}

export function removeMinus(val: number): number {
  return val < 0 ? -val : val
}

export const translate = <T extends string | number | symbol>(
  translationMap: Record<T, Record<ELanguages, string>>,
  key: T,
  language: ELanguages
): string => {
  return translationMap[key]?.[language] ?? (key as string)
}

export function getKeyByValue(
  enumObj:
    | TCategoryByLanguages
    | typeof EJokeType
    | typeof ESafemode
    | typeof ELanguages,
  value: ECategories | EJokeType | ESafemode | ELanguages
) {
  for (const key in enumObj) {
    if (enumObj[key as keyof typeof enumObj] === value) {
      return key
    }
  }
  // Handle the case where the value is not found in the enum
  return undefined
}

// Helper to get hex value from any color format
export const getHexFromColor = (color: string, type: string) => {
  if (type === 'hex') return color.toUpperCase()
  if (type === 'hsl') {
    const hslMatch = /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/i.exec(
      color
    )
    if (hslMatch) {
      const h = Number(hslMatch[1])
      const s = Number(hslMatch[2])
      const l = Number(hslMatch[3])
      const rgb = hslToRGB(h, s, l)
      return rgbToHex(rgb.r, rgb.g, rgb.b)
    }
  }
  if (type === 'rgb') {
    const rgbMatch = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i.exec(color)
    if (rgbMatch) {
      const r = Number(rgbMatch[1])
      const g = Number(rgbMatch[2])
      const b = Number(rgbMatch[3])
      return rgbToHex(r, g, b)
    }
  }
  return color
}

export const sleep = (ms: number) =>
  new Promise<void>((res) => setTimeout(res, ms))

export const colorNameToHex = (color: string) => {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  // Validate by using a sentinel first
  const sentinel = 'rgb(1, 2, 3)'
  ctx.fillStyle = sentinel
  ctx.fillStyle = color

  // If invalid, fillStyle stays at sentinel
  if (ctx.fillStyle === sentinel) {
    throw new Error(`Invalid color: ${color}`)
  }

  return ctx.fillStyle // can be "#rrggbb" or "rgb(r, g, b)"
}

export const hexToRGB = (value: string) => {
  if (value.startsWith('rgb(')) {
    const m = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(value)
    if (!m) throw new Error(`Unsupported rgb format: ${value}`)
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
  }

  // Handle hex formats, including #ccc
  if (!value.startsWith('#'))
    throw new Error(`Unsupported color format: ${value}`)

  let hex = value.slice(1)
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((ch) => ch + ch)
      .join('')
  if (hex.length !== 6) throw new Error(`Unsupported hex length: ${value}`)

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return { r, g, b }
}

export const calculateLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

export const determineBackgroundLightness = (color: string) => {
  const normalized = color.startsWith('#') ? color : colorNameToHex(color)
  const rgb = hexToRGB(normalized)
  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.179 ? 'light' : 'dark'
}
