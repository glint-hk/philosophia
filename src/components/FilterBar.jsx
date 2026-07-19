import { categoryColor } from '../utils/categories'

const DIFFICULTIES = [
  { value: 1, label: 'Introductory' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
]

export function FilterBar({ categories, eras, filters, onFilter, resultCount, total }) {
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
    <div className="filter-bar">
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

      <div className="filter-meta">
        <span className="result-count" aria-live="polite">
          {resultCount === total ? `${total} concepts` : `${resultCount} of ${total}`}
        </span>
        {hasFilters && (
          <button className="clear-filters" onClick={clearAll}>Clear filters</button>
        )}
      </div>
    </div>
  )
}
