import { useContext } from 'react'
import { ThemeUpdateContext, ThemeContext } from '../contexts/ThemeContext'

function useTheme() {
  return useContext(ThemeContext)
}

function useThemeUpdate() {
  return useContext(ThemeUpdateContext)
}

export { useTheme, useThemeUpdate }
