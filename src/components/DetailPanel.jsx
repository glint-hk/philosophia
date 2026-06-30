import { useState } from 'react'
import { toPlainText, toMarkdown, toObsidian } from '../utils/copyFormats'

const REL_COLORS = {
  opposes: 'rel-opposes',
  extends: 'rel-extends',
  parallel: 'rel-parallel',
  resolves: 'rel-resolves',
}

const DIFF_LABELS = { 1: 'Introductory', 2: 'Intermediate', 3: 'Advanced' }
const DIFF_DOTS = { 1: '●○○', 2: '●●○', 3: '●●●' }

export function DetailPanel({
  concept,
  onClose,
  onTraverse,
  onRelatedClick,
  inConstellation,
  onConstellationToggle,
}) {
  const [copied, setCopied] = useState(null)

  if (!concept) return null

  async function copy(format) {
    let text
    if (format === 'plain') text = toPlainText(concept)
    else if (format === 'markdown') text = toMarkdown(concept)
    else text = toObsidian(concept)

    await navigator.clipboard.writeText(text)
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <aside className="detail-panel" role="complementary" aria-label="Concept details">
      <div className="detail-header">
        <button className="detail-close" onClick={onClose} aria-label="Close detail panel">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="detail-actions-top">
          <button
            className={`btn-ghost ${inConstellation ? 'active' : ''}`}
            onClick={() => onConstellationToggle(concept.name)}
            title={inConstellation ? 'Remove from constellation' : 'Add to constellation'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <polygon
                points="8,1.5 9.8,6 14.5,6 10.8,8.9 12.2,13.5 8,10.5 3.8,13.5 5.2,8.9 1.5,6 6.2,6"
                stroke="currentColor"
                strokeWidth="1.2"
                fill={inConstellation ? 'currentColor' : 'none'}
              />
            </svg>
            {inConstellation ? 'In Constellation' : 'Add to Constellation'}
          </button>

          <button
            className="btn-ghost traverse-action"
            onClick={() => onTraverse(concept)}
            title="Open in Traverse Mode"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="3" fill="currentColor" />
              <circle cx="2" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="14" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="2" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="14" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.1" />
              <line x1="8" y1="5" x2="3.5" y2="3" stroke="currentColor" strokeWidth="1" />
              <line x1="8" y1="5" x2="12.5" y2="3" stroke="currentColor" strokeWidth="1" />
              <line x1="8" y1="11" x2="3.5" y2="13" stroke="currentColor" strokeWidth="1" />
              <line x1="8" y1="11" x2="12.5" y2="13" stroke="currentColor" strokeWidth="1" />
            </svg>
            Traverse
          </button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-meta">
          <span className="detail-category">{concept.category}</span>
          <span className="detail-era">{concept.era}</span>
          <span className="detail-diff" title={DIFF_LABELS[concept.difficulty]}>
            {DIFF_DOTS[concept.difficulty]}
          </span>
        </div>

        <h2 className="detail-name">{concept.name}</h2>
        <p className="detail-thinker">{concept.thinker}</p>

        <p className="detail-description">{concept.description}</p>

        {concept.thinkerBio && (
          <div className="detail-bio">
            <h4>About the Thinker</h4>
            <p>{concept.thinkerBio}</p>
          </div>
        )}

        {concept.quote && (
          <blockquote className="detail-quote">
            <p>"{concept.quote}"</p>
            <cite>— {concept.thinker}</cite>
          </blockquote>
        )}

        {concept.related?.length > 0 && (
          <div className="detail-related">
            <h4>Related Concepts</h4>
            <ul className="related-list">
              {concept.related.map(r => (
                <li key={r.name} className="related-item">
                  <button
                    className={`related-link ${REL_COLORS[r.type] || ''}`}
                    onClick={() => onRelatedClick(r.name)}
                  >
                    {r.name}
                  </button>
                  <span className="related-type">{r.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {concept.books?.length > 0 && (
          <div className="detail-books">
            <h4>Further Reading</h4>
            <ul className="books-list">
              {concept.books.map(b => (
                <li key={b.title}>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="book-link">
                    <span className="book-title">{b.title}</span>
                    <span className="book-author">by {b.author}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {concept.tags?.length > 0 && (
          <div className="detail-tags">
            {concept.tags.map(t => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="detail-copy">
        <span className="copy-label">Copy as</span>
        <button className={`copy-btn ${copied === 'plain' ? 'copied' : ''}`} onClick={() => copy('plain')}>
          {copied === 'plain' ? 'Copied!' : 'Plain text'}
        </button>
        <button className={`copy-btn ${copied === 'markdown' ? 'copied' : ''}`} onClick={() => copy('markdown')}>
          {copied === 'markdown' ? 'Copied!' : 'Markdown'}
        </button>
        <button className={`copy-btn ${copied === 'obsidian' ? 'copied' : ''}`} onClick={() => copy('obsidian')}>
          {copied === 'obsidian' ? 'Copied!' : 'Obsidian'}
        </button>
      </div>
    </aside>
  )
}
