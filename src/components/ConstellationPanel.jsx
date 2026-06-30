import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { toObsidian } from '../utils/copyFormats'

export function ConstellationPanel({ constellation, concepts, onClose, onSelect }) {
  const entries = Object.entries(constellation).sort((a, b) => new Date(b[1]) - new Date(a[1]))
  const conceptMap = Object.fromEntries(concepts.map(c => [c.name, c]))

  const categoryBreakdown = entries.reduce((acc, [name]) => {
    const cat = conceptMap[name]?.category || 'Unknown'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  async function exportObsidian() {
    const zip = new JSZip()
    const folder = zip.folder('Philosophia Constellation')

    entries.forEach(([name]) => {
      const concept = conceptMap[name]
      if (concept) {
        folder.file(`${name}.md`, toObsidian(concept))
      }
    })

    const readme = [
      '# My Philosophia Constellation',
      '',
      `Exported on ${new Date().toLocaleDateString()}`,
      '',
      `${entries.length} concept${entries.length !== 1 ? 's' : ''}:`,
      ...entries.map(([name]) => `- [[${name}]]`),
    ].join('\n')
    folder.file('_README.md', readme)

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'philosophia-constellation.zip')
  }

  return (
    <aside className="constellation-panel" role="complementary" aria-label="My Constellation">
      <div className="panel-header">
        <h2>My Constellation</h2>
        <button className="detail-close" onClick={onClose} aria-label="Close constellation panel">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state constellation-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <polygon points="24,4 28.4,16.5 42,16.5 31.3,25 35.7,37.5 24,29 12.3,37.5 16.7,25 6,16.5 19.6,16.5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
          </svg>
          <p>No concepts added yet.</p>
          <p className="empty-hint">Click the star icon on any concept card or in the detail panel to add it here.</p>
        </div>
      ) : (
        <>
          <div className="constellation-stats">
            <span className="stat">{entries.length} concept{entries.length !== 1 ? 's' : ''}</span>
            <span className="stat">{Object.keys(categoryBreakdown).length} categories</span>
          </div>

          <div className="category-breakdown">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} className="category-bar">
                  <span className="cat-name">{cat}</span>
                  <div className="cat-bar-wrap">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${(count / entries.length) * 100}%` }}
                    />
                  </div>
                  <span className="cat-count">{count}</span>
                </div>
              ))}
          </div>

          <ul className="constellation-list">
            {entries.map(([name, addedAt]) => {
              const concept = conceptMap[name]
              return (
                <li key={name} className="constellation-item">
                  <button className="constellation-concept" onClick={() => onSelect(concept)}>
                    <span className="const-name">{name}</span>
                    {concept && <span className="const-cat">{concept.category}</span>}
                  </button>
                  <span className="const-date">
                    {new Date(addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="constellation-export">
            <button className="btn-primary" onClick={exportObsidian}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 10V2M8 10l-3-3M8 10l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export to Obsidian (.zip)
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
