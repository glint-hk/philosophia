import { useEffect, useRef, useCallback, useMemo } from 'react'
import * as d3 from 'd3'

const REL_STYLE = {
  opposes:  { stroke: '#ef4444', strokeDasharray: '6 3', label: 'opposes' },
  extends:  { stroke: '#22c55e', strokeDasharray: null,  label: 'extends' },
  parallel: { stroke: '#f59e0b', strokeDasharray: '2 3', label: 'parallel' },
  resolves: { stroke: '#3b82f6', strokeDasharray: null,  label: 'resolves' },
}

export function TraverseMode({ concepts, centerConcept, onSelect, onClose, dark }) {
  const svgRef = useRef(null)
  const simRef = useRef(null)
  const stateRef = useRef({ center: centerConcept, selected: centerConcept })

  const conceptMap = useMemo(
    () => Object.fromEntries(concepts.map(c => [c.name, c])),
    [concepts]
  )

  const draw = useCallback(() => {
    const center = stateRef.current.center
    if (!center || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = svgRef.current.clientWidth
    const H = svgRef.current.clientHeight
    const cx = W / 2
    const cy = H / 2

    const related = center.related || []
    const relatedNames = new Set(related.map(r => r.name))

    // Build nodes: center + orbit nodes
    const nodes = [
      { ...center, role: 'center', x: cx, y: cy, fx: cx, fy: cy },
      ...related.map((r, i) => {
        const concept = conceptMap[r.name]
        const angle = (i / related.length) * 2 * Math.PI - Math.PI / 2
        const radius = Math.min(W, H) * 0.3
        return {
          ...(concept || { name: r.name }),
          role: 'orbit',
          relType: r.type,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        }
      }),
    ]

    const links = related.map(r => ({
      source: center.name,
      target: r.name,
      type: r.type,
    }))

    // Wake nodes: related to orbit nodes (2nd degree)
    const wakeNodes = []
    const wakeLinks = []
    const allNames = new Set([center.name, ...relatedNames])

    related.forEach(r => {
      const orbitConcept = conceptMap[r.name]
      if (!orbitConcept?.related) return
      orbitConcept.related.slice(0, 2).forEach(w => {
        if (allNames.has(w.name)) return
        allNames.add(w.name)
        const wc = conceptMap[w.name]
        wakeNodes.push({ ...(wc || { name: w.name }), role: 'wake', relType: w.type })
        wakeLinks.push({ source: r.name, target: w.name, type: w.type })
      })
    })

    const allNodes = [...nodes, ...wakeNodes]
    const allLinks = [...links, ...wakeLinks]

    // Build id map for simulation
    const nodeById = Object.fromEntries(allNodes.map(n => [n.name, n]))

    const g = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', e => g.attr('transform', e.transform))
    svg.call(zoom)

    if (simRef.current) simRef.current.stop()

    simRef.current = d3.forceSimulation(allNodes)
      .force('link', d3.forceLink(allLinks)
        .id(d => d.name)
        .distance(d => {
          if (d.source.role === 'center' || d.target.role === 'center') return 160
          return 120
        })
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collision', d3.forceCollide(50))
      .force('center', d3.forceCenter(cx, cy).strength(0.05))
      .on('tick', ticked)

    const linkEls = g.append('g').selectAll('line')
      .data(allLinks)
      .join('line')
      .attr('stroke', d => REL_STYLE[d.type]?.stroke || '#888')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => REL_STYLE[d.type]?.strokeDasharray || null)
      .attr('opacity', 0.7)

    const nodeEls = g.append('g').selectAll('g.node')
      .data(allNodes)
      .join('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (e, d) => {
            if (!e.active) simRef.current.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end', (e, d) => {
            if (!e.active) simRef.current.alphaTarget(0)
            if (d.role !== 'center') { d.fx = null; d.fy = null }
          })
      )
      .on('click', (e, d) => {
        e.stopPropagation()
        if (d.role === 'center') {
          onSelect(d)
        } else {
          const full = conceptMap[d.name]
          if (full) {
            stateRef.current.center = full
            draw()
          }
        }
      })

    nodeEls.append('circle')
      .attr('r', d => d.role === 'center' ? 36 : d.role === 'orbit' ? 22 : 14)
      .attr('fill', d => {
        if (d.role === 'center') return dark ? '#7BAF8E' : '#4a7c5c'
        if (d.role === 'orbit') return dark ? '#1E2E25' : '#e8f0eb'
        return dark ? '#131A16' : '#f4f7f5'
      })
      .attr('stroke', d => {
        if (d.role === 'center') return dark ? '#7BAF8E' : '#4a7c5c'
        return d.relType ? (REL_STYLE[d.relType]?.stroke || '#888') : '#888'
      })
      .attr('stroke-width', d => d.role === 'center' ? 2 : 1.5)

    nodeEls.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.role === 'wake' ? '0.35em' : '-0.3em')
      .attr('font-size', d => d.role === 'center' ? 11 : d.role === 'orbit' ? 9.5 : 8)
      .attr('font-weight', d => d.role === 'center' ? 600 : 400)
      .attr('fill', d => d.role === 'center' ? (dark ? '#0A0F0D' : '#fff') : (dark ? '#c8d8cc' : '#2a3d2e'))
      .attr('pointer-events', 'none')
      .each(function(d) {
        const el = d3.select(this)
        const words = d.name.split(' ')
        const maxWords = d.role === 'center' ? 3 : 2
        if (words.length <= maxWords) {
          el.text(d.name)
        } else {
          el.text(words.slice(0, maxWords).join(' '))
          el.append('tspan')
            .attr('x', 0)
            .attr('dy', '1.2em')
            .text(words.slice(maxWords).join(' '))
        }
      })

    if (nodeEls.size() > 1) {
      nodeEls.filter(d => d.role !== 'center').append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.role === 'orbit' ? '1.2em' : '1.2em')
        .attr('font-size', 7.5)
        .attr('fill', dark ? '#7BAF8E' : '#4a7c5c')
        .attr('pointer-events', 'none')
        .text(d => d.thinker?.split(' ').pop() || '')
    }

    function ticked() {
      linkEls
        .attr('x1', d => nodeById[d.source.name || d.source]?.x || 0)
        .attr('y1', d => nodeById[d.source.name || d.source]?.y || 0)
        .attr('x2', d => nodeById[d.target.name || d.target]?.x || 0)
        .attr('y2', d => nodeById[d.target.name || d.target]?.y || 0)

      nodeEls.attr('transform', d => `translate(${d.x},${d.y})`)
    }
  }, [conceptMap, dark, onSelect])

  useEffect(() => {
    stateRef.current.center = centerConcept
    draw()
    return () => simRef.current?.stop()
  }, [centerConcept, draw])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="traverse-mode">
      <div className="traverse-toolbar">
        <span className="traverse-title">
          {stateRef.current.center?.name || 'Graph'}
        </span>
        <div className="traverse-legend">
          {Object.entries(REL_STYLE).map(([type, style]) => (
            <span key={type} className="legend-item">
              <svg width="20" height="8" aria-hidden="true">
                <line
                  x1="0" y1="4" x2="20" y2="4"
                  stroke={style.stroke}
                  strokeWidth="2"
                  strokeDasharray={style.strokeDasharray || ''}
                />
              </svg>
              <span>{style.label}</span>
            </span>
          ))}
        </div>
        <div className="traverse-hints">
          <span>Click node to re-center</span>
          <span>Scroll to zoom</span>
        </div>
        <button className="btn-ghost" onClick={onClose} aria-label="Exit traverse mode">
          ← Back to Grid
        </button>
      </div>
      <svg ref={svgRef} className="traverse-svg" />
    </div>
  )
}
