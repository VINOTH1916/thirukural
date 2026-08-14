import { useState, useEffect } from 'react'

const THEMES = ['satva', 'rajas', 'tamas']
const STORAGE_KEY = 'thirukural-theme'
const DEFAULT_THEME = 'tamas'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(saved) ? saved : DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const cycleTheme = () => {
    setTheme(current => {
      const idx = THEMES.indexOf(current)
      return THEMES[(idx + 1) % THEMES.length]
    })
  }

  const pickTheme = (name) => {
    if (THEMES.includes(name)) setTheme(name)
  }

  return { theme, cycleTheme, pickTheme, themes: THEMES }
}
