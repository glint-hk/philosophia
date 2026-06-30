import { useState, useEffect, useMemo } from 'react'
import { buildFuse } from '../utils/search'

export function useConcepts() {
  const [concepts, setConcepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/concepts.json')
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load concepts: ${r.status}`)
        return r.json()
      })
      .then(data => {
        // Only surface concepts with all required base fields populated
        const complete = data.filter(c => c.name && c.thinker && c.category && c.era && c.description)
        setConcepts(complete)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const fuse = useMemo(() => concepts.length ? buildFuse(concepts) : null, [concepts])

  const categories = useMemo(
    () => [...new Set(concepts.map(c => c.category).filter(Boolean))].sort(),
    [concepts]
  )

  const eras = useMemo(
    () => [...new Set(concepts.map(c => c.era).filter(Boolean))].sort(),
    [concepts]
  )

  return { concepts, loading, error, fuse, categories, eras }
}
