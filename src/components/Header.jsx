import { useRef, useEffect } from 'react'

export function Header({
  mode,
  onModeToggle,
  searchQuery,
  onSearch,
  dark,
  onDarkToggle,
  onConstellationOpen,
  constellationOpen,
  constellationCount,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <span className="logo" aria-label="Philosophia">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="8" r="2" fill="currentColor" />
            <circle cx="7" cy="16" r="2" fill="currentColor" />
            <circle cx="17" cy="16" r="2" fill="currentColor" />
            <line x1="12" y1="10" x2="7" y2="14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1" />
            <line x1="12" y1="10" x2="17" y2="14" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="logo-text">Philosophia</span>
        </span>
      </div>

      <div className="header-center">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search concepts… (⌘K)"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            aria-label="Search philosophical concepts"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearch('')} aria-label="Clear search">×</button>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          className={`mode-toggle btn-ghost ${mode === 'traverse' ? 'active' : ''}`}
          onClick={onModeToggle}
          title={mode === 'grid' ? 'Switch to Traverse Mode (T)' : 'Switch to Grid Mode (T)'}
          aria-label={mode === 'grid' ? 'Switch to Traverse Mode' : 'Switch to Grid Mode'}
          aria-pressed={mode === 'traverse'}
        >
          {mode === 'grid' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="3" fill="currentColor" />
              <circle cx="2.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="15.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="2.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="15.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="9" y1="6" x2="4" y2="4" stroke="currentColor" strokeWidth="1.1" />
              <line x1="9" y1="6" x2="14" y2="4" stroke="currentColor" strokeWidth="1.1" />
              <line x1="9" y1="12" x2="4" y2="14" stroke="currentColor" strokeWidth="1.1" />
              <line x1="9" y1="12" x2="14" y2="14" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="10" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          )}
          <span>{mode === 'grid' ? 'Graph' : 'Grid'}</span>
        </button>

        <button
          className={`btn-ghost constellation-btn ${constellationOpen ? 'active' : ''}`}
          onClick={onConstellationOpen}
          title="My Constellation (C)"
          aria-label="My Constellation"
          aria-expanded={constellationOpen}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <polygon points="9,2 10.8,7 16,7 11.8,10.2 13.6,15.2 9,12 4.4,15.2 6.2,10.2 2,7 7.2,7" stroke="currentColor" strokeWidth="1.3" fill="none" />
          </svg>
          {constellationCount > 0 && (
            <span className="constellation-count">{constellationCount}</span>
          )}
        </button>

        <button
          className="btn-ghost dark-toggle"
          onClick={onDarkToggle}
          title="Toggle dark mode (D)"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={dark}
        >
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="3.5" fill="currentColor" />
              <line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="9" x2="3" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M14 9.5A6 6 0 0 1 8.5 4a6 6 0 1 0 5.5 5.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
