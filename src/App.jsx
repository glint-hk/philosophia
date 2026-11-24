import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { useConstellation } from './hooks/useConstellation'
import { useConcepts } from './hooks/useConcepts'
import { search } from './utils/search'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { ConceptGrid } from './components/ConceptGrid'
import { DetailPanel } from './components/DetailPanel'
import { Hero } from './components/Hero'
import { Discovery } from './components/Discovery'

const TraverseMode = lazy(() =>
  import('./components/TraverseMode').then(module => ({ default: module.TraverseMode }))
)
const ConstellationPanel = lazy(() =>
  import('./components/ConstellationPanel').then(module => ({ default: module.ConstellationPanel }))
)

const EMPTY_FILTERS = { categories: [], eras: [], difficulties: [] }

function parseUrl() {
  const params = new URLSearchParams(window.location.search)
  const requestedMode = params.get('mode')
  return {
    mode: requestedMode === 'traverse' ? 'traverse' : 'grid',
    concept: params.get('concept') || null,
    q: params.get('q') || '',
  }
}

function syncUrl(state) {
  const params = new URLSearchParams()
  if (state.mode && state.mode !== 'grid') params.set('mode', state.mode)
  if (state.concept) params.set('concept', state.concept)
  if (state.q) params.set('q', state.q)
  const qs = params.toString()
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
}

const DEFAULT_TITLE = 'Philosophia — Explore Philosophical Concepts'
const DEFAULT_DESCRIPTION =
  'A graph-native explorer for 400 philosophical concepts across 15 traditions. Navigate ideas, discover connections, and build your own constellation of thought.'

function setMetaDescription(text) {
  document.querySelector('meta[name="description"]')?.setAttribute('content', text)
}

export default function App() {
  const { dark, toggle: toggleDark } = useDarkMode()
  const { constellation, toggle: constellationToggle } = useConstellation()
  const { concepts, loading, error, fuse, categories, eras } = useConcepts()

  const [initial] = useState(parseUrl)
  const [mode, setMode] = useState(initial.mode)
  const [searchQuery, setSearchQuery] = useState(initial.q)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedConcept, setSelectedConcept] = useState(null)
  const [traverseConcept, setTraverseConcept] = useState(null)
  const [constellationOpen, setConstellationOpen] = useState(false)
  const lastFocusedRef = useRef(null)
  const panelOpen = Boolean(selectedConcept || constellationOpen)

  // Fixed-body locking also prevents background scrolling in iOS Safari.
  useEffect(() => {
    if (!panelOpen) return
    const scrollY = window.scrollY
    const body = document.body
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width }
    Object.assign(body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%' })
    return () => {
      Object.assign(body.style, previous)
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [panelOpen])

  // Restores focus to whatever triggered a panel/mode — falling back to the
  // header's mode toggle if that element no longer exists in the DOM (e.g.
  // Traverse Mode fully unmounts Grid Mode, so the concept card that opened
  // it is gone by the time we come back and a stale ref would silently drop
  // focus to <body>).
  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => {
      const el = lastFocusedRef.current
      if (el && document.body.contains(el)) el.focus()
      else (document.querySelector('.map-center') || document.querySelector('.mode-toggle'))?.focus()
    })
  }, [])

  const conceptMap = useMemo(
    () => Object.fromEntries(concepts.map(c => [c.name, c])),
    [concepts]
  )

  useEffect(() => {
    if (!concepts.length || !initial.concept) return
    const found = conceptMap[initial.concept]
    if (!found) return
    if (initial.mode === 'traverse') setTraverseConcept(found)
    else setSelectedConcept(found)
  }, [concepts, conceptMap, initial])

  useEffect(() => {
    syncUrl({
      mode,
      concept: traverseConcept?.name || selectedConcept?.name || null,
      q: searchQuery,
    })
  }, [mode, selectedConcept, traverseConcept, searchQuery])

  useEffect(() => {
    function onPopState() {
      const next = parseUrl()
      const concept = next.concept ? conceptMap[next.concept] : null
      setMode(next.mode)
      setSearchQuery(next.q)
      setSelectedConcept(next.mode === 'grid' ? concept : null)
      setTraverseConcept(next.mode === 'traverse' ? concept : null)
      setConstellationOpen(false)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [conceptMap])

  useEffect(() => {
    const active = traverseConcept || selectedConcept
    document.title = active ? `${active.name} — Philosophia` : DEFAULT_TITLE
    setMetaDescription(active ? `${active.description?.slice(0, 155)}…` : DEFAULT_DESCRIPTION)
  }, [selectedConcept, traverseConcept])

  const toggleMode = useCallback(() => {
      if (mode === 'grid') {
        lastFocusedRef.current = document.activeElement
        setTraverseConcept(selectedConcept || conceptMap.Existentialism || concepts[0])
        setSelectedConcept(null)
        setMode('traverse')
        return
      }
      setTraverseConcept(null)
      restoreFocus()
      setMode('grid')
  }, [conceptMap, concepts, restoreFocus, selectedConcept, mode])

  useEffect(() => {
    function onKey(e) {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'd' || e.key === 'D') toggleDark()
      if (e.key === 't' || e.key === 'T') toggleMode()
      if (e.key === 'c' || e.key === 'C') handleConstellationToggleOpen()
      if (e.key === 'Escape') {
        if (selectedConcept || constellationOpen) {
          setSelectedConcept(null)
          setConstellationOpen(false)
          restoreFocus()
        } else if (mode === 'traverse') {
          setMode('grid')
          setTraverseConcept(null)
          restoreFocus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleDark, toggleMode, selectedConcept, constellationOpen, mode, restoreFocus])

  const handleSelectConcept = useCallback((concept) => {
    if (!document.querySelector('[role="dialog"]')) lastFocusedRef.current = document.activeElement
    setSelectedConcept(concept)
    setConstellationOpen(false)
  }, [])

  function handleDetailClose() {
    setSelectedConcept(null)
    restoreFocus()
  }

  function handleTraverse(concept) {
    lastFocusedRef.current = document.activeElement
    setTraverseConcept(concept || concepts[0])
    setMode('traverse')
    setSelectedConcept(null)
  }

  function handleTraverseClose() {
    setMode('grid')
    setTraverseConcept(null)
    restoreFocus()
  }

  const handleTraverseCenter = useCallback((concept) => {
    setTraverseConcept(concept)
    setSelectedConcept(null)
  }, [])

  function handleRandomConcept() {
    if (!concepts.length) return
    const concept = concepts[Math.floor(Math.random() * concepts.length)]
    handleSelectConcept(concept)
  }

  function handleSearchFocus() {
    document.querySelector('.search-input')?.focus()
  }

  function handleRelatedClick(name) {
    const concept = conceptMap[name]
    if (concept) setSelectedConcept(concept)
  }

  function handleConstellationToggleOpen() {
    setConstellationOpen(o => {
      if (!o) lastFocusedRef.current = document.activeElement
      return !o
    })
  }

  function handleConstellationClose() {
    setConstellationOpen(false)
    restoreFocus()
  }

  function handleConstellationSelect(concept) {
    setConstellationOpen(false)
    if (concept) setSelectedConcept(concept)
  }

  const filteredCount = useMemo(() => {
    if (!concepts.length) return 0
    let list = concepts
    if (searchQuery && fuse) list = search(fuse, searchQuery) || list
    if (filters.categories.length) list = list.filter(c => filters.categories.includes(c.category))
    if (filters.eras.length) list = list.filter(c => filters.eras.includes(c.era))
    if (filters.difficulties.length) list = list.filter(c => filters.difficulties.includes(c.difficulty))
    return list.length
  }, [concepts, fuse, searchQuery, filters])

  const constellationCount = Object.keys(constellation).length

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark" aria-label="Loading concepts" />
        <p>Loading Philosophia…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Failed to load concepts</h2>
        <p>{error}</p>
        <p className="error-hint">Make sure <code>public/concepts.json</code> exists and is valid JSON.</p>
      </div>
    )
  }

  if (mode === 'traverse') {
    const center = traverseConcept || concepts[0]
    return (
      <div className="app" data-mode="traverse">
        <Suspense fallback={<div className="mode-loading">Mapping the constellation…</div>}>
          <TraverseMode
            concepts={concepts}
            centerConcept={center}
            onCenterChange={handleTraverseCenter}
            onSelect={handleSelectConcept}
            onClose={handleTraverseClose}
            dark={dark}
          />
        </Suspense>

        {panelOpen && (
          <div
            className="scrim"
            aria-hidden="true"
            onClick={() => {
              setSelectedConcept(null)
              setConstellationOpen(false)
              restoreFocus()
            }}
          />
        )}
        {selectedConcept && (
          <DetailPanel
            concept={selectedConcept}
            onClose={handleDetailClose}
            onTraverse={handleTraverseCenter}
            onRelatedClick={handleRelatedClick}
            inConstellation={Boolean(constellation[selectedConcept.name])}
            onConstellationToggle={constellationToggle}
          />
        )}
        {constellationOpen && (
          <Suspense fallback={null}>
            <ConstellationPanel
              constellation={constellation}
              concepts={concepts}
              onClose={handleConstellationClose}
              onSelect={handleConstellationSelect}
            />
          </Suspense>
        )}
      </div>
    )
  }


  return (
    <div className="app" data-mode="grid">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <Header
        mode={mode}
        onModeToggle={toggleMode}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        dark={dark}
        onDarkToggle={toggleDark}
        onConstellationOpen={handleConstellationToggleOpen}
        constellationOpen={constellationOpen}
        constellationCount={constellationCount}
      />

      {!searchQuery && <Hero
        onExplore={handleSearchFocus}
        onTraverse={() => handleTraverse(conceptMap.Existentialism || concepts[0])}
        onRandom={handleRandomConcept}
      />}

      {!searchQuery && (
        <Discovery concepts={concepts} onSelect={handleSelectConcept} onTraverse={handleTraverse} />
      )}

      <div className="atlas-heading"><div><p className="section-kicker">The collection</p><h2>Find your next idea.</h2></div><p>Search, filter, or follow a connection.</p></div>

      <FilterBar
        categories={categories}
        eras={eras}
        filters={filters}
        onFilter={setFilters}
        resultCount={filteredCount}
        total={concepts.length}
      />

      <main id="main-content" tabIndex={-1} className={`main-content ${panelOpen ? 'panel-open' : ''}`}>
        <ConceptGrid
          concepts={concepts}
          fuse={fuse}
          searchQuery={searchQuery}
          filters={filters}
          onSelect={handleSelectConcept}
          onTraverse={handleTraverse}
          constellation={constellation}
          onConstellationToggle={constellationToggle}
        />
      </main>

      {panelOpen && (
        <div
          className="scrim"
          aria-hidden="true"
          onClick={() => {
            setSelectedConcept(null)
            setConstellationOpen(false)
            restoreFocus()
          }}
        />
      )}

      {selectedConcept && (
        <DetailPanel
          concept={selectedConcept}
          onClose={handleDetailClose}
          onTraverse={handleTraverse}
          onRelatedClick={handleRelatedClick}
          inConstellation={Boolean(constellation[selectedConcept.name])}
          onConstellationToggle={constellationToggle}
        />
      )}

      {constellationOpen && (
        <Suspense fallback={null}>
          <ConstellationPanel
            constellation={constellation}
            concepts={concepts}
            onClose={handleConstellationClose}
            onSelect={handleConstellationSelect}
          />
        </Suspense>
      )}
    </div>
  )
}
