import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { useConstellation } from './hooks/useConstellation'
import { useConcepts } from './hooks/useConcepts'
import { search } from './utils/search'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { ConceptGrid } from './components/ConceptGrid'
import { DetailPanel } from './components/DetailPanel'
import { TraverseMode } from './components/TraverseMode'
import { ConstellationPanel } from './components/ConstellationPanel'

const EMPTY_FILTERS = { categories: [], eras: [], difficulties: [] }

function parseUrl() {
  const params = new URLSearchParams(window.location.search)
  return {
    mode: params.get('mode') || 'grid',
    concept: params.get('concept') || null,
    q: params.get('q') || '',
  }
}

function pushUrl(state) {
  const params = new URLSearchParams()
  if (state.mode && state.mode !== 'grid') params.set('mode', state.mode)
  if (state.concept) params.set('concept', state.concept)
  if (state.q) params.set('q', state.q)
  const qs = params.toString()
  window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
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

  const initial = parseUrl()
  const [mode, setMode] = useState(initial.mode)
  const [searchQuery, setSearchQuery] = useState(initial.q)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedConcept, setSelectedConcept] = useState(null)
  const [traverseConcept, setTraverseConcept] = useState(null)
  const [constellationOpen, setConstellationOpen] = useState(false)
  const lastFocusedRef = useRef(null)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts])

  useEffect(() => {
    pushUrl({
      mode,
      concept: traverseConcept?.name || selectedConcept?.name || null,
      q: searchQuery,
    })
  }, [mode, selectedConcept, traverseConcept, searchQuery])

  useEffect(() => {
    const active = traverseConcept || selectedConcept
    document.title = active ? `${active.name} — Philosophia` : DEFAULT_TITLE
    setMetaDescription(active ? `${active.description?.slice(0, 155)}…` : DEFAULT_DESCRIPTION)
  }, [selectedConcept, traverseConcept])

  const toggleMode = useCallback(() => {
    setMode(m => {
      if (m === 'grid') return 'traverse'
      setTraverseConcept(null)
      return 'grid'
    })
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'd' || e.key === 'D') toggleDark()
      if (e.key === 't' || e.key === 'T') toggleMode()
      if (e.key === 'c' || e.key === 'C') handleConstellationToggleOpen()
      if (e.key === 'Escape' && (selectedConcept || constellationOpen)) {
        setSelectedConcept(null)
        setConstellationOpen(false)
        requestAnimationFrame(() => lastFocusedRef.current?.focus?.())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleDark, toggleMode, selectedConcept, constellationOpen])

  function handleSelectConcept(concept) {
    if (!selectedConcept) lastFocusedRef.current = document.activeElement
    setSelectedConcept(concept)
    setConstellationOpen(false)
  }

  function handleDetailClose() {
    setSelectedConcept(null)
    requestAnimationFrame(() => lastFocusedRef.current?.focus?.())
  }

  function handleTraverse(concept) {
    setTraverseConcept(concept || concepts[0])
    setMode('traverse')
    setSelectedConcept(null)
  }

  function handleTraverseClose() {
    setMode('grid')
    setTraverseConcept(null)
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
    requestAnimationFrame(() => lastFocusedRef.current?.focus?.())
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
        <TraverseMode
          concepts={concepts}
          centerConcept={center}
          onSelect={handleSelectConcept}
          onClose={handleTraverseClose}
          dark={dark}
        />
      </div>
    )
  }

  const panelOpen = Boolean(selectedConcept || constellationOpen)

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
            requestAnimationFrame(() => lastFocusedRef.current?.focus?.())
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
        <ConstellationPanel
          constellation={constellation}
          concepts={concepts}
          onClose={handleConstellationClose}
          onSelect={handleConstellationSelect}
        />
      )}
    </div>
  )
}
