# stale/

Source and intermediate data files that are not served by the app and are
not read by `npm run merge` at runtime. Kept for provenance / re-derivation,
not for production.

- `Philosophia_Vol2-4_*.docx` — original source documents for concepts
  92–365. Consumed by `scripts/parse-volumes.js` (`npm run parse-volumes`)
  to (re)generate base fields (`description`, `thinker`, `category`, `era`,
  `difficulty`) in `public/concepts.json`. Safe to re-run: it only fills in
  fields that are currently missing, never overwrites existing ones.
- `philosophia_data_chunk*.json` and `philosophia_COMPLETE_all_concepts.json`
  — enrichment drops (`thinkerBio`, `quote`, `tags`, `related`, `books`)
  previously consumed by `scripts/merge-concepts.js`. Already fully merged
  into `public/concepts.json`. If a new enrichment drop arrives, place it in
  `public/` (not here) so `npm run merge` picks it up, then move it here
  once merged.
