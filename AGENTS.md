# Wake Time Calculator – Agent Guide

## Scope
These instructions apply to the entire repository.

## Project Snapshot
- **Entry point**: `wake.html` contains the complete UI, styling, and client-side logic.
- **Supporting files**: `index.html` (redirect for GitHub Pages), `README.md` (user-facing overview), `package.json` (utility scripts), `.gitignore` (excludes `wake.min.html`, `node_modules/`, etc.).
- **Tech stack**: vanilla HTML/CSS/JS with TailwindCSS + DaisyUI loaded from CDNs; there is no bundler or build pipeline.

## Workflow Checklist
1. Keep edits narrowly focused on the requested change; avoid broad refactors or introducing new tooling.
2. Preserve the single-file architecture—do not add frameworks, build steps, or external asset pipelines.
3. Match existing formatting and naming conventions (the file is Prettier-friendly but largely hand-formatted).
4. Prefer `rg`, `sed -n`, or targeted search to navigate `wake.html`; it is long, so avoid full-file rewrites.
5. Update or consult `agent.md` for deep technical details (APIs, algorithms, storage keys) when the change touches weather logic.

## Scripts & Commands
Run these from the repository root:

| Purpose | Command |
| --- | --- |
| Serve locally (Node) | `npm start` → http://localhost:8000/wake.html |
| Serve locally (Python) | `npm run serve` or `python3 -m http.server 8000` |
| Format `wake.html` | `npm run format` |
| HTML validation | `npm run validate` |
| Lightweight smoke check | `npm run smoke` |

Always run `npm run format` and `npm run validate` after making changes to `wake.html`. Execute `npm run smoke` if you modified network calls or markup that could impact loading.

## Testing Expectations
There is no automated test suite beyond the scripts above. Manually verify the wake-time output when crossing midnight and ensure the awareness bar still renders when geolocation is unavailable.

## Common Gotchas
- LocalStorage keys are prefixed with `wake:`; keep names stable to avoid breaking saved data.
- The awareness bar caches API responses for 15 minutes—respect `CACHE_DURATION` and existing caching helpers.
- Trail wetness categories are consumed in multiple spots (badging + text); adjust both when modifying thresholds.
- Do not commit `wake.min.html` or `node_modules/` (both are ignored but double-check before committing).

## Resources
- Use `README.md` for high-level project context.
- Use `agent.md` for detailed algorithm notes and API references.
- Tailwind components rely on CDN versions defined in the `<head>` of `wake.html`; keep the order intact when editing.
