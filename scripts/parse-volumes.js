#!/usr/bin/env node
/**
 * Parses Vol2–Vol4 DOCX files and produces base concept entries:
 *   name, thinker, category, era, difficulty, description
 *
 * Then merges with the existing base concepts.json (Vol1 / chunk data),
 * so the final concepts.json has every concept ready for the enrichment merge.
 *
 * Run:  node scripts/parse-volumes.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

import { execSync } from 'child_process'

const PY_HELPER = join(__dirname, '_docx_reader.py')
writeFileSync(PY_HELPER, `
import zipfile, xml.etree.ElementTree as ET, json, sys
path = sys.argv[1]
with zipfile.ZipFile(path) as z:
    xml = z.read('word/document.xml')
root = ET.fromstring(xml)
texts = []
for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    runs = [r.text for r in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if r.text]
    if runs:
        texts.append(''.join(runs))
print(json.dumps(texts))
`.trim())

function readDocxLines(filePath) {
  const result = execSync(`python3 "${PY_HELPER}" "${filePath}"`, {
    maxBuffer: 10 * 1024 * 1024,
  })
  return JSON.parse(result.toString())
}

// ── Parser ─────────────────────────────────────────────────────────────────────
const DEPTH_MAP = { Entry: 1, Mid: 2, Deep: 3 }
const VALID_ERAS = new Set(['Ancient', 'Medieval', 'Modern', 'Contemporary'])
const VALID_DEPTHS = new Set(['Entry', 'Mid', 'Deep'])

// Known domains (normalise to canonical category names)
const DOMAIN_MAP = {
  'Ethics': 'Ethics',
  'Metaphysics': 'Metaphysics',
  'Epistemology': 'Epistemology',
  'Logic': 'Logic',
  'Logic & Language': 'Logic & Language',
  'Political Philosophy': 'Political Philosophy',
  'Philosophy of Mind': 'Philosophy of Mind',
  'Mind & Consciousness': 'Philosophy of Mind',
  'Aesthetics': 'Aesthetics',
  'Philosophy of Science': 'Philosophy of Science',
  'Eastern Philosophy': 'Eastern Philosophy',
  'Existentialism': 'Existentialism',
  'Philosophy of Language': 'Philosophy of Language',
  'Continental Philosophy': 'Continental Philosophy',
  'Indian Philosophy': 'Indian Philosophy',
  'Social Philosophy': 'Social Philosophy',
  'African Philosophy': 'African Philosophy',
  'Feminist Philosophy': 'Feminist Philosophy',
  'Analytic Ethics': 'Ethics',
  'Chinese Philosophy': 'Eastern Philosophy',
}

function parseConcepts(lines, expectedRange) {
  const [minId, maxId] = expectedRange
  const concepts = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    const num = parseInt(line, 10)

    // Look for a line that is just a concept number in our expected range
    if (!isNaN(num) && num >= minId && num <= maxId && String(num) === line) {
      // Next lines should be: name, thinker, domain, era, depth
      if (i + 5 >= lines.length) { i++; continue }

      const name   = lines[i + 1]?.trim()
      const thinker= lines[i + 2]?.trim()
      const domain = lines[i + 3]?.trim()
      const era    = lines[i + 4]?.trim()
      const depth  = lines[i + 5]?.trim()

      // Validate the header fields
      if (
        name && thinker &&
        DOMAIN_MAP[domain] &&
        VALID_ERAS.has(era) &&
        VALID_DEPTHS.has(depth)
      ) {
        // Collect definition paragraphs until next concept number or end
        const descParts = []
        let j = i + 6
        while (j < lines.length) {
          const next = lines[j].trim()
          const nextNum = parseInt(next, 10)
          // Stop when we hit the next concept number
          if (!isNaN(nextNum) && nextNum === minId + concepts.length + 1 && String(nextNum) === next) break
          if (!isNaN(nextNum) && nextNum > num && nextNum <= maxId && String(nextNum) === next) break
          // Skip table header lines
          if (['#', 'Concept', 'Thinker(s)', 'Domain', 'Era', 'Depth', 'Definition (~150 words)'].includes(next)) {
            j++; continue
          }
          if (next) descParts.push(next)
          j++
        }

        concepts.push({
          id: num,
          name,
          thinker,
          category: DOMAIN_MAP[domain],
          era,
          difficulty: DEPTH_MAP[depth],
          description: descParts.join(' '),
        })

        i = j
        continue
      }
    }
    i++
  }

  return concepts
}

// ── Main ───────────────────────────────────────────────────────────────────────
const volumes = [
  { file: 'Philosophia_Vol2_Concepts_92-182.docx',      range: [92, 182] },
  { file: 'Philosophia_Vol3_Concepts_183-273.docx',     range: [183, 273] },
  { file: 'Philosophia_Vol4_Concepts_274-365_FINAL.docx', range: [274, 365] },
]

const allNewConcepts = []

for (const { file, range } of volumes) {
  const filePath = join(PUBLIC, file)
  console.log(`\nParsing ${file}...`)
  try {
    const lines = readDocxLines(filePath)
    const concepts = parseConcepts(lines, range)
    console.log(`  Found ${concepts.length} concepts (expected ~${range[1] - range[0] + 1})`)
    if (concepts.length > 0) {
      console.log(`  First: [${concepts[0].id}] ${concepts[0].name}`)
      console.log(`  Last:  [${concepts[concepts.length - 1].id}] ${concepts[concepts.length - 1].name}`)
    }
    allNewConcepts.push(...concepts)
  } catch (err) {
    console.error(`  ERROR: ${err.message}`)
  }
}

// Load existing base concepts.json (Vol1 placeholder + chunk data)
const existingRaw = JSON.parse(readFileSync(join(PUBLIC, 'concepts.json'), 'utf8'))
const existingByName = Object.fromEntries(existingRaw.map(c => [c.name, c]))

// Merge: new DOCX concepts provide base fields for chunk-only entries
let updated = 0
let added = 0

for (const concept of allNewConcepts) {
  const { id, ...fields } = concept
  if (existingByName[fields.name]) {
    // Patch missing base fields onto existing entry (from chunk data)
    const existing = existingByName[fields.name]
    if (!existing.thinker)     existing.thinker     = fields.thinker
    if (!existing.category)    existing.category    = fields.category
    if (!existing.era)         existing.era         = fields.era
    if (!existing.difficulty)  existing.difficulty  = fields.difficulty
    if (!existing.description) existing.description = fields.description
    updated++
  } else {
    existingByName[fields.name] = fields
    added++
  }
}

const merged = Object.values(existingByName)
writeFileSync(join(PUBLIC, 'concepts.json'), JSON.stringify(merged, null, 2), 'utf8')

console.log(`\n── Result ──────────────────────────────────────────`)
console.log(`  Updated existing entries: ${updated}`)
console.log(`  New entries added:        ${added}`)
console.log(`  Total in concepts.json:   ${merged.length}`)
console.log(`  Missing base fields:      ${merged.filter(c => !c.thinker).length}`)
console.log(`Written → public/concepts.json`)
