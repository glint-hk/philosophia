import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('philosophia-dark')
      if (stored !== null) return stored === 'true'
    } catch {
      // Fall back to the system preference when storage is unavailable.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    try {
      localStorage.setItem('philosophia-dark', String(dark))
    } catch {
      // The visual preference still applies for the current session.
    }
  }, [dark])

  const toggle = () => setDark(d => !d)

  return { dark, toggle }
}
