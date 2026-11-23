import { useEffect, useRef, useState, useMemo } from 'react'
import { graphLayout } from '../utils/graphLayout'

const RELATIONS = {
  opposes: { color: '#ef7184', label: 'Opposes', dash: '7 5' },
  extends: { color: '#38b889', label: 'Extends' },
  parallel: { color: '#c99939', label: 'Parallel', dash: '3 5' },
  resolves: { color: '#619bdf', label: 'Resolves' },
}

export function TraverseMode({ concepts, centerConcept, onCenterChange, onSelect, onClose }) {
  const stageRef = useRef(null)
  const previousCenter = useRef(centerConcept?.name)
  const [width, setWidth] = useState(1000)
  const [zoom, setZoom] = useState(1)
  const [trail, setTrail] = useState([])
  const conceptMap = useMemo(() => new Map(concepts.map(c => [c.name, c])), [concepts])
  const related = (centerConcept?.related || []).filter(r => conceptMap.has(r.name))
  const layout = graphLayout(width, related.length)

  useEffect(() => {
    const stage = stageRef.current
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)))
    if (stage) observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setZoom(1)
    stageRef.current?.scrollTo({ top: 0, left: 0 })
    if (previousCenter.current !== centerConcept?.name) {
      stageRef.current?.querySelector('.map-center')?.focus({ preventScroll: true })
      previousCenter.current = centerConcept?.name
    }
  }, [centerConcept?.name])

  if (!centerConcept) return null

  function navigate(name) {
    setTrail(previous => [...previous, centerConcept.name].slice(-8))
    onCenterChange(conceptMap.get(name))
  }

  function goBack() {
    const name = trail[trail.length - 1]
    if (!name) return
    setTrail(previous => previous.slice(0, -1))
    onCenterChange(conceptMap.get(name))
  }

  function reset() {
    setZoom(1)
    stageRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  return (
    <div className="relationship-view">
      <header className="relationship-header">
        <div><p className="section-kicker">The constellation</p><h1>{centerConcept.name}</h1></div>
        <button className="hero-secondary" onClick={onClose}>Back to atlas</button>
      </header>
      <div className="relationship-subheader">
        <p>Every idea opens another door. Select a connected idea to keep exploring.</p>
        <button className="btn-ghost" onClick={goBack} disabled={!trail.length}>Previous idea{trail.length > 0 ? ` (${trail.length})` : ''}</button>
      </div>
      <div className="relationship-stage" ref={stageRef} tabIndex={0} aria-label="Scrollable concept map">
        <div className="relationship-size" style={{ width: width * zoom, height: layout.height * zoom }}>
          <div className="relationship-canvas" style={{ width, height: layout.height, transform: `scale(${zoom})` }} onKeyDown={event => {
            if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key) || !event.target.closest('.map-card')) return
            const cards = Array.from(event.currentTarget.querySelectorAll('.map-card'))
            const index = cards.indexOf(event.target.closest('.map-card'))
            const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1
            event.preventDefault()
            cards[(index + direction + cards.length) % cards.length]?.focus()
          }}>
            <svg width={width} height={layout.height} className="relationship-lines" aria-hidden="true">
              <defs><radialGradient id="center-glow"><stop stopColor="var(--accent)" stopOpacity=".12" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient></defs>
              <circle cx={layout.center.x} cy={layout.center.y} r={layout.mobile ? 145 : 210} fill="url(#center-glow)" />
              {related.map((relation, i) => {
                const node = layout.nodes[i]
                const style = RELATIONS[relation.type] || RELATIONS.parallel
                const startX = layout.mobile ? layout.center.x : layout.center.x + (node.x < layout.center.x ? -1 : 1) * layout.cardWidth / 2
                const startY = layout.mobile ? layout.center.y + 90 : layout.center.y
                const endX = layout.mobile ? node.x : node.x + (node.x < layout.center.x ? 1 : -1) * layout.cardWidth / 2
                const endY = layout.mobile ? node.y - 90 : node.y
                const midX = (startX + endX) / 2
                return <path key={relation.name} d={layout.mobile ? `M${startX},${startY} C${startX},${startY + 45} ${endX},${startY + 45} ${endX},${endY}` : `M${startX},${startY} C${midX},${startY} ${midX},${endY} ${endX},${endY}`} fill="none" stroke={style.color} strokeWidth="1.5" strokeDasharray={style.dash} opacity=".65" />
              })}
            </svg>
            <button className="map-card map-center" style={{ left: layout.center.x, top: layout.center.y, width: layout.mobile ? Math.min(260, width - 40) : layout.cardWidth }} onClick={() => onSelect(centerConcept)}>
              <span className="map-role">You are exploring</span>
              <strong>{centerConcept.name}</strong>
              <span className="map-thinker">{centerConcept.thinker}</span>
              <span className="map-action">Read this idea</span>
            </button>
            {related.map((relation, i) => {
              const concept = conceptMap.get(relation.name)
              const style = RELATIONS[relation.type] || RELATIONS.parallel
              return <button key={relation.name} className="map-card" style={{ left: layout.nodes[i].x, top: layout.nodes[i].y, width: layout.cardWidth, '--relation-color': style.color }} onClick={() => navigate(relation.name)}>
                <span className="map-role">{style.label}</span>
                <strong>{concept.name}</strong>
                <span className="map-thinker">{concept.thinker}</span>
                <span className="map-action">Explore connections</span>
              </button>
            })}
          </div>
        </div>
      </div>
      <footer className="relationship-footer">
        <div className="relationship-legend">{Object.entries(RELATIONS).map(([key, style]) => <span key={key}><i style={{ background: style.color }} />{style.label}</span>)}</div>
        <div className="relationship-controls" aria-label="Map controls">
          <button onClick={() => setZoom(value => Math.max(.75, value - .25))} disabled={zoom <= .75} aria-label="Zoom out">−</button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(value => Math.min(1.75, value + .25))} disabled={zoom >= 1.75} aria-label="Zoom in">+</button>
          <button onClick={reset}>Reset</button>
        </div>
      </footer>
      <div className="sr-only" role="status" aria-live="polite">Exploring {centerConcept.name}. {related.length} connected ideas.</div>
    </div>
  )
}
