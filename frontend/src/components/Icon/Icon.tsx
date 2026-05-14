import { useEffect } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import { iconLibraries } from './iconLibraries'

type IconLibraries = typeof iconLibraries
type IconLib = keyof IconLibraries

type BaseIconProps = {
  className?: string
  style?: CSSProperties
  height?: string
  width?: string
  title?: string
  viewBox?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  'aria-label'?: string
}

type IconProps =
  | {
      [L in IconLib]: BaseIconProps & {
        lib: L
        name: keyof IconLibraries[L]
      }
    }[IconLib]
  | (BaseIconProps & {
      lib?: undefined
      name?: undefined
    })

const Icon = ({
  lib,
  name,
  className,
  style,
  height,
  width,
  title,
  viewBox,
  'aria-hidden': ariaHidden = 'true',
  'aria-label': ariaLabel,
}: IconProps) => {
  const library = lib ? iconLibraries[lib] : undefined
  // const IconComp = lib && name ? (library?.[name] ?? null) : null
  const IconComp =
    lib && name
      ? (((iconLibraries[lib] as Record<string, ComponentType<any>>)[
          name as string
        ] ?? null) as ComponentType<any> | null)
      : null

  const isMissing = !lib || !name || !library || !IconComp
  const missingTitle =
    title ?? `Missing icon: ${lib ?? '(no lib)'}/${name ?? '(no name)'}`

  useEffect(() => {
    if (!isMissing) return
    if (!import.meta.env.DEV) return
    console.warn('Missing icon', { lib, name })
  }, [isMissing, lib, name])

  if (isMissing && import.meta.env.DEV && typeof window !== 'undefined') {
    throw new Error(missingTitle)
  }

  if (isMissing) return null

  return (
    <IconComp
      className={className}
      style={style}
      height={height}
      width={width}
      {...(viewBox ? { viewBox } : {})}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      title={title}
    />
  )
}

export default Icon
