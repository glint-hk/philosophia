import Fuse from 'fuse.js'

export function buildFuse(concepts) {
  return new Fuse(concepts, {
    threshold: 0.35,
    includeScore: true,
    keys: [
      { name: 'name', weight: 3 },
      { name: 'thinker', weight: 2 },
      { name: 'domain', weight: 1 },
      { name: 'description', weight: 1 },
    ],
  })
}

export function search(fuse, query) {
  if (!query || !query.trim()) return null
  return fuse.search(query.trim()).map(r => r.item)
}
