#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from public/concepts.json so it stays in
 * sync whenever the concept dataset changes.
 *
 * Run:  node scripts/generate-sitemap.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')
const SITE = 'https://glint-hk.github.io/philosophia/'

const concepts = JSON.parse(readFileSync(join(PUBLIC, 'concepts.json'), 'utf8'))

const urls = [
  { loc: SITE, changefreq: 'weekly', priority: '1.0' },
  ...[...concepts]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => ({
      loc: `${SITE}?${new URLSearchParams({ concept: c.name }).toString()}`,
      changefreq: 'monthly',
      priority: '0.6',
    })),
]

const body = urls
  .map(u => `  <url>\n    <loc>${u.loc.replace(/&/g, '&amp;')}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

writeFileSync(join(PUBLIC, 'sitemap.xml'), xml, 'utf8')
console.log(`Written → public/sitemap.xml (${urls.length} urls)`)
