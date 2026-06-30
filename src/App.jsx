import { useState, useEffect, useCallback, useMemo } from 'react'
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
      if (e.key === 'c' || e.key === 'C') setConstellationOpen(o => !o)
      if (e.key === 'Escape') { setSelectedConcept(null); setConstellationOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleDark, toggleMode])

  function handleSelectConcept(concept) {
    setSelectedConcept(concept)
    setConstellationOpen(false)
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
        <div className="loading-spinner" aria-label="Loading concepts" />
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

  return (
    <div className="app" data-mode="grid">
      <Header
        mode={mode}
        onModeToggle={toggleMode}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        dark={dark}
        onDarkToggle={toggleDark}
        onConstellationOpen={() => setConstellationOpen(o => !o)}
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

      <main className={`main-content ${selectedConcept || constellationOpen ? 'panel-open' : ''}`}>
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

      {selectedConcept && (
        <DetailPanel
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
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
          onClose={() => setConstellationOpen(false)}
          onSelect={handleConstellationSelect}
        />
      )}
    </div>
  )
}
