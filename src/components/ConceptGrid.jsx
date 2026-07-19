import { useMemo } from 'react'
import { ConceptCard } from './ConceptCard'
import { search } from '../utils/search'

export function ConceptGrid({
  concepts,
  fuse,
  searchQuery,
  filters,
  onSelect,
  onTraverse,
  constellation,
  onConstellationToggle,
}) {
  const visible = useMemo(() => {
    let list = concepts

    if (searchQuery) {
      list = search(fuse, searchQuery) || list
    }

    if (filters.categories.length) {
      list = list.filter(c => filters.categories.includes(c.category))
    }
    if (filters.eras.length) {
      list = list.filter(c => filters.eras.includes(c.era))
    }
    if (filters.difficulties.length) {
      list = list.filter(c => filters.difficulties.includes(c.difficulty))
    }

    return list
  }, [concepts, fuse, searchQuery, filters])

  if (!visible.length) {
    return (
      <div className="empty-state">
        <p>No concepts match your filters.</p>
        <p className="empty-hint">Try broadening your search or clearing some filters.</p>
      </div>
    )
  }

  return (
    <div className="concept-grid">
      {visible.map(concept => (
        <ConceptCard
          key={concept.name}
          concept={concept}
          onSelect={onSelect}
          onTraverse={onTraverse}
          inConstellation={Boolean(constellation[concept.name])}
          onConstellationToggle={onConstellationToggle}
        />
      ))}
    </div>
  )
}
