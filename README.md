# Philosophia

Philosophia is an interactive atlas of 400 philosophical concepts across 15
traditions. Search the collection, follow labeled relationships through a readable
concept map, save a personal reading path, and export it to Obsidian.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check
npm run validate-data
```

## Deploy on Embarko or another root-domain host

The default production build uses `/` as its base path, which is suitable for
an Embarko subdomain:

```bash
npm run build
```

Publish the generated `dist/` directory. Before submission, update the
canonical and social URLs in `index.html`, then generate the sitemap for the
final Embarko URL:

```bash
SITE_URL=https://your-app.embarko.app/ npm run generate-sitemap
SITE_URL=https://your-app.embarko.app/ npm run build
```

## GitHub Pages

GitHub Pages serves this repository from `/philosophia/`, so its workflow sets
`VITE_BASE_PATH=/philosophia/`. The equivalent local build is:

```bash
npm run build:github
```

## Keyboard controls

- `Command/Ctrl + K`: focus search
- `T`: toggle graph mode
- `D`: toggle dark mode
- `C`: open My Constellation
- `Escape`: close the active panel or graph
- Arrow keys: move between graph nodes

## Content pipeline

`public/concepts.json` is the production dataset. Source DOCX files and prior
enrichment drops are retained under `stale/` for provenance.

- `npm run parse-volumes`: recover base fields from the source DOCX volumes
- `npm run merge`: merge enrichment JSON files temporarily placed in `public/`
- `npm run generate-sitemap`: rebuild the concept sitemap
- `npm run build-data`: run the complete content pipeline

The UI filters incomplete concepts defensively, while `npm run validate-data`
fails CI when names, required fields, relationships, difficulty values, or book
URLs are invalid.
