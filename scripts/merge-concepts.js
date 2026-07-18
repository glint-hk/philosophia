#!/usr/bin/env node
/**
 * Merges all enrichment source files into concepts.json.
 *
 * Base file (public/concepts.json): name, thinker, category, era, difficulty, description
 * Source files: any public/*.json whose top-level shape is either a bare array
 *   of entries or `{ completion: [...] }`, where each entry provides
 *   thinkerBio, quote, tags, related, books for a concept `name`.
 *
 * Entry deltas normalised before merge:
 *   - related[].type  capitalised → lowercased  ("Opposes" → "opposes")
 *   - related[].note  stripped (not used by the app)
 *   - books[].why     stripped (not used by the app)
 *
 * An enrichment entry whose name has no matching base concept (no
 * description/thinker/category/era/difficulty) is NOT silently inserted —
 * that produces a broken stub the app's useConcepts filter hides entirely.
 * It's reported instead so base fields can be supplied deliberately.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')
const REQUIRED_BASE_FIELDS = ['thinker', 'category', 'era', 'difficulty', 'description']

function normaliseRelated(related = []) {
  return related.map(({ name, type }) => ({
    name,
    type: type.toLowerCase(),
  }))
}

function normaliseBooks(books = []) {
  return books.map(({ title, author, url }) => ({ title, author, url }))
}

function hasCompleteBase(concept) {
  return REQUIRED_BASE_FIELDS.every(f => {
    const v = concept[f]
    return v !== undefined && v !== null && v !== ''
  })
}

// Load base concepts
const baseRaw = readFileSync(join(PUBLIC, 'concepts.json'), 'utf8')
const base = JSON.parse(baseRaw)
const byName = Object.fromEntries(base.map(c => [c.name, c]))

// Collect all candidate enrichment source files (excludes concepts.json itself)
const sourceFiles = readdirSync(PUBLIC)
  .filter(f => f.endsWith('.json') && f !== 'concepts.json')
  .filter(f => {
    try {
      const parsed = JSON.parse(readFileSync(join(PUBLIC, f), 'utf8'))
      return Array.isArray(parsed) || Array.isArray(parsed.completion)
    } catch {
      return false
    }
  })
  .sort()

console.log(`Base concepts: ${base.length}`)
console.log(`Source files found: ${sourceFiles.length} → ${sourceFiles.join(', ')}`)

let enriched = 0
const skippedOrphans = new Set()

for (const file of sourceFiles) {
  const raw = JSON.parse(readFileSync(join(PUBLIC, file), 'utf8'))
  const entries = Array.isArray(raw) ? raw : raw.completion || []

  for (const entry of entries) {
    const { name, thinkerBio, quote, tags, related, books } = entry
    const target = byName[name]

    if (target && hasCompleteBase(target)) {
      Object.assign(target, {
        thinkerBio,
        quote,
        tags,
        related: normaliseRelated(related),
        books: normaliseBooks(books),
      })
      enriched++
    } else {
      // No base concept exists yet (or it's an incomplete stub) — skip rather
      // than write a half-populated entry the app will silently hide.
      skippedOrphans.add(name)
    }
  }
}

const merged = Object.values(byName)
writeFileSync(join(PUBLIC, 'concepts.json'), JSON.stringify(merged, null, 2) + '\n', 'utf8')

console.log(`Enriched: ${enriched} | Total: ${merged.length}`)
if (skippedOrphans.size) {
  console.log(`\nSkipped ${skippedOrphans.size} enrichment entr${skippedOrphans.size === 1 ? 'y' : 'ies'} with no complete base concept to attach to:`)
  for (const name of skippedOrphans) console.log(`  - ${name}`)
  console.log('Add description/thinker/category/era/difficulty for these in concepts.json first, then re-run.')
}
console.log('Written → public/concepts.json')
