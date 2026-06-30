import { useState, useCallback } from 'react'

const KEY = 'philosophia-constellation'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function useConstellation() {
  const [constellation, setConstellation] = useState(load)

  const add = useCallback((name) => {
    setConstellation(prev => {
      if (prev[name]) return prev
      const next = { ...prev, [name]: new Date().toISOString() }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((name) => {
    setConstellation(prev => {
      const next = { ...prev }
      delete next[name]
      localStorage.setItem(KEY, JSON.stringify(next))
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
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { constellation, add, remove, has, toggle }
}
