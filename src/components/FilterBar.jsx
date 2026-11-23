import { categoryColor } from '../utils/categories'
import { useState } from 'react'

const DIFFICULTIES = [
  { value: 1, label: 'Introductory' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
]

export function FilterBar({ categories, eras, filters, onFilter, resultCount, total }) {
  const [expanded, setExpanded] = useState(false)
  const selectedCount = filters.categories.length + filters.eras.length + filters.difficulties.length
  const hasFilters = filters.categories.length || filters.eras.length || filters.difficulties.length

  function toggleCategory(cat) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat]
    onFilter({ ...filters, categories: next })
  }

  function toggleEra(era) {
    const next = filters.eras.includes(era)
      ? filters.eras.filter(e => e !== era)
      : [...filters.eras, era]
    onFilter({ ...filters, eras: next })
  }

  function toggleDifficulty(d) {
    const next = filters.difficulties.includes(d)
      ? filters.difficulties.filter(x => x !== d)
      : [...filters.difficulties, d]
    onFilter({ ...filters, difficulties: next })
  }

  function clearAll() {
    onFilter({ categories: [], eras: [], difficulties: [] })
  }

  return (
    <section className="filter-bar" aria-label="Filter the concept collection">
      <div className="filter-summary">
        <button className="filter-disclosure" aria-expanded={expanded} aria-controls="atlas-filter-options" onClick={() => setExpanded(value => !value)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
          {expanded ? 'Hide filters' : 'Refine your exploration'}
          {selectedCount > 0 && <span className="filter-count">{selectedCount}</span>}
        </button>
        <span className="result-count" aria-live="polite">{resultCount === total ? `${total} concepts` : `${resultCount} of ${total} concepts`}</span>
        {Boolean(hasFilters) && <button className="clear-filters" onClick={clearAll}>Clear all</button>}
      </div>
      {selectedCount > 0 && <div className="active-filters" aria-label="Active filters">
        {filters.categories.map(value => <button key={value} onClick={() => toggleCategory(value)} aria-label={`Remove ${value} filter`}>{value}<span aria-hidden="true">×</span></button>)}
        {filters.eras.map(value => <button key={value} onClick={() => toggleEra(value)} aria-label={`Remove ${value} filter`}>{value}<span aria-hidden="true">×</span></button>)}
        {filters.difficulties.map(value => <button key={value} onClick={() => toggleDifficulty(value)} aria-label={`Remove ${DIFFICULTIES[value - 1].label} filter`}>{DIFFICULTIES[value - 1].label}<span aria-hidden="true">×</span></button>)}
      </div>}
      <div id="atlas-filter-options" className="filter-options" hidden={!expanded}>
      <div className="filter-section">
        <span className="filter-label">Category</span>
        <div className="chip-list">
          {categories.map(cat => {
            const color = categoryColor(cat)
            const active = filters.categories.includes(cat)
            return (
              <button
                key={cat}
                className={`chip ${active ? 'chip-active' : ''}`}
                style={{ '--cat-color': color }}
                onClick={() => toggleCategory(cat)}
                aria-pressed={active}
              >
                <span className="chip-dot" style={{ background: active ? color : undefined }} />
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-label">Era</span>
        <div className="chip-list">
          {eras.map(era => (
            <button
              key={era}
              className={`chip ${filters.eras.includes(era) ? 'chip-active' : ''}`}
              onClick={() => toggleEra(era)}
              aria-pressed={filters.eras.includes(era)}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-label">Depth</span>
        <div className="chip-list">
          {DIFFICULTIES.map(({ value, label }) => (
            <button
              key={value}
              className={`chip ${filters.difficulties.includes(value) ? 'chip-active' : ''}`}
              onClick={() => toggleDifficulty(value)}
              aria-pressed={filters.difficulties.includes(value)}
            >
              {'●'.repeat(value)}{'○'.repeat(3 - value)} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-done"><button className="hero-secondary" onClick={() => setExpanded(false)}>Show {resultCount} concepts</button></div>
      </div>
    </section>
  )
}
