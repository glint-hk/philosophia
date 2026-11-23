import { useState, useCallback } from 'react'

const KEY = 'philosophia-constellation'

function load() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY))
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function persist(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Storage may be unavailable in private browsing or a restricted iframe.
  }
}

export function useConstellation() {
  const [constellation, setConstellation] = useState(load)

  const add = useCallback((name) => {
    setConstellation(prev => {
      if (prev[name]) return prev
      const next = { ...prev, [name]: new Date().toISOString() }
      persist(next)
      return next
    })
  }, [])

  const remove = useCallback((name) => {
    setConstellation(prev => {
      const next = { ...prev }
      delete next[name]
      persist(next)
      return next
    })
  }, [])

  const has = useCallback((name) => Boolean(constellation[name]), [constellation])

  const toggle = useCallback((name) => {
    setConstellation(prev => {
      const next = { ...prev }
      if (next[name]) {
        delete next[name]
      } else {
        next[name] = new Date().toISOString()
      }
      persist(next)
      return next
    })
  }, [])

  return { constellation, add, remove, has, toggle }
}
