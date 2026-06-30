#!/usr/bin/env node
/**
 * Merges all philosophia_data_chunk*.json enrichment files into concepts.json.
 *
 * Base file  (public/concepts.json):       name, thinker, category, era, difficulty, description
 * Chunk files (public/philosophia_data_*.json): thinkerBio, quote, tags, related, books
 *
 * Chunk deltas normalised before merge:
 *   - related[].type  capitalised → lowercased  ("Opposes" → "opposes")
 *   - related[].note  stripped
 *   - books[].why     stripped
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

function normaliseRelated(related = []) {
  return related.map(({ name, type }) => ({
    name,
    type: type.toLowerCase(),
  }))
}

function normaliseBooks(books = []) {
  return books.map(({ title, author, url }) => ({ title, author, url }))
}

// Load base concepts
const baseRaw = readFileSync(join(PUBLIC, 'concepts.json'), 'utf8')
const base = JSON.parse(baseRaw)
const byName = Object.fromEntries(base.map(c => [c.name, c]))

// Collect all chunk files
const chunkFiles = readdirSync(PUBLIC)
  .filter(f => f.startsWith('philosophia_data_chunk') && f.endsWith('.json'))
  .sort()

console.log(`Base concepts: ${base.length}`)
console.log(`Chunk files found: ${chunkFiles.length} → ${chunkFiles.join(', ')}`)

let enriched = 0
let added = 0

for (const file of chunkFiles) {
  const raw = JSON.parse(readFileSync(join(PUBLIC, file), 'utf8'))
  const entries = raw.completion || []

  for (const entry of entries) {
    const { name, thinkerBio, quote, tags, related, books } = entry

    if (byName[name]) {
      // Merge enrichment into existing base entry
      Object.assign(byName[name], {
        thinkerBio,
        quote,
        tags,
        related: normaliseRelated(related),
        books: normaliseBooks(books),
      })
      enriched++
    } else {
      // Add as new entry (base fields will be missing — added when full base is provided)
      byName[name] = {
        name,
        thinkerBio,
        quote,
        tags,
        related: normaliseRelated(related),
        books: normaliseBooks(books),
      }
      added++
    }
  }
}

const merged = Object.values(byName)
writeFileSync(join(PUBLIC, 'concepts.json'), JSON.stringify(merged, null, 2), 'utf8')

console.log(`Enriched: ${enriched} | Added from chunks only: ${added} | Total: ${merged.length}`)
console.log('Written → public/concepts.json')
