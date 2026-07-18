export const CATEGORY_COLORS = {
  'Ethics':                  '#f97316',
  'Metaphysics':             '#a855f7',
  'Epistemology':            '#06b6d4',
  'Logic':                   '#ec4899',
  'Logic & Language':        '#e879f9',
  'Political Philosophy':    '#ef4444',
  'Philosophy of Mind':      '#3b82f6',
  'Aesthetics':              '#f59e0b',
  'Philosophy of Science':   '#22c55e',
  'Eastern Philosophy':      '#84cc16',
  'Existentialism':          '#fb923c',
  'Philosophy of Language':  '#14b8a6',
  'Continental Philosophy':  '#818cf8',
  'Indian Philosophy':       '#fbbf24',
  'African Philosophy':      '#4ade80',
  'Feminist Philosophy':     '#f472b6',
  'Social Philosophy':       '#fb7185',
}

export function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#6ee7b7'
}
