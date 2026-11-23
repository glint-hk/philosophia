#!/usr/bin/env node

import { readFileSync } from 'node:fs'

const concepts = JSON.parse(readFileSync(new URL('../public/concepts.json', import.meta.url), 'utf8'))
const required = ['name', 'thinker', 'category', 'era', 'difficulty', 'description', 'thinkerBio', 'quote']
const allowedRelationships = new Set(['opposes', 'extends', 'parallel', 'resolves'])
const names = new Set()
const errors = []

for (const [index, concept] of concepts.entries()) {
  const label = concept.name || `entry ${index + 1}`

  for (const field of required) {
    if (concept[field] === undefined || concept[field] === null || concept[field] === '') {
      errors.push(`${label}: missing ${field}`)
    }
  }

  if (names.has(concept.name)) errors.push(`${label}: duplicate name`)
  names.add(concept.name)

  if (![1, 2, 3].includes(concept.difficulty)) {
    errors.push(`${label}: difficulty must be 1, 2, or 3`)
  }

  for (const field of ['related', 'books', 'tags']) {
    if (!Array.isArray(concept[field])) errors.push(`${label}: ${field} must be an array`)
  }
}

for (const concept of concepts) {
  for (const relation of concept.related || []) {
    if (!names.has(relation.name)) errors.push(`${concept.name}: unknown relation ${relation.name}`)
    if (relation.name === concept.name) errors.push(`${concept.name}: self relation`)
    if (!allowedRelationships.has(relation.type)) {
      errors.push(`${concept.name}: invalid relation type ${relation.type}`)
    }
  }

  for (const book of concept.books || []) {
    try {
      const url = new URL(book.url)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
    } catch {
      errors.push(`${concept.name}: invalid book URL ${book.url}`)
    }
  }
}

if (errors.length) {
  console.error(`Concept validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

const relationships = concepts.reduce((total, concept) => total + concept.related.length, 0)
console.log(`Validated ${concepts.length} concepts and ${relationships} relationships.`)
