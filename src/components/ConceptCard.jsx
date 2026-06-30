const DIFF_DOTS = { 1: '●○○', 2: '●●○', 3: '●●●' }

export function ConceptCard({ concept, onSelect, onTraverse, inConstellation, onConstellationToggle }) {
  const firstSentence = concept.description?.split(/(?<=[.!?])\s/)[0] || ''

  return (
    <article
      className="concept-card"
      onClick={() => onSelect(concept)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(concept)}
      aria-label={`${concept.name} by ${concept.thinker}`}
    >
      <div className="card-header">
        <h3 className="card-name">{concept.name}</h3>
        <span className="card-diff" title={`Difficulty: ${concept.difficulty}/3`}>
          {DIFF_DOTS[concept.difficulty] || '○○○'}
        </span>
      </div>

      <p className="card-thinker">{concept.thinker}</p>
      <p className="card-category">{concept.category}</p>

      <p className="card-excerpt">{firstSentence}</p>

      <div className="card-actions">
        <button
          className="card-action-btn traverse-btn"
          onClick={e => { e.stopPropagation(); onTraverse(concept) }}
          title="Open in Traverse Mode"
          aria-label={`Explore ${concept.name} in graph mode`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="2.5" fill="currentColor" />
            <circle cx="1.5" cy="2" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="12.5" cy="2" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="1.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="12.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1" />
            <line x1="7" y1="4.5" x2="3" y2="3" stroke="currentColor" strokeWidth="0.9" />
            <line x1="7" y1="4.5" x2="11" y2="3" stroke="currentColor" strokeWidth="0.9" />
            <line x1="7" y1="9.5" x2="3" y2="11" stroke="currentColor" strokeWidth="0.9" />
            <line x1="7" y1="9.5" x2="11" y2="11" stroke="currentColor" strokeWidth="0.9" />
          </svg>
        </button>

        <button
          className={`card-action-btn constellation-btn ${inConstellation ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); onConstellationToggle(concept.name) }}
          title={inConstellation ? 'Remove from constellation' : 'Add to constellation'}
          aria-label={inConstellation ? `Remove ${concept.name} from constellation` : `Add ${concept.name} to constellation`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <polygon
              points="7,1 8.4,5 13,5 9.3,7.9 10.7,12 7,9.1 3.3,12 4.7,7.9 1,5 5.6,5"
              stroke="currentColor"
              strokeWidth="1.1"
              fill={inConstellation ? 'currentColor' : 'none'}
            />
          </svg>
        </button>
      </div>
    </article>
  )
}
