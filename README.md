# Wake Time Calculator (Agent README)

Weather-aware wake time calculator for runners. Vanilla JS ES modules served directly from `src/` (no bundler or transpiler).

## Code map
- `src/index.html` – UI shell
- `src/css/main.css` – styles
- `src/js/app/main.js` – app orchestrator (state, events, persistence)
- `src/js/app/awareness.js` – weather/dawn awareness UI
- `src/js/app/weather.js` – Open-Meteo integration + wetness scoring (NJ coastal calibration)
- `src/js/app/location.js` – geolocation + geocoding
- `src/js/app/dawn.js` – dawn times (SunriseSunset.io)
- `src/js/app/ui.js` – UI helpers
- `src/js/lib/calculator.js` – wake-time math (only file with unit tests)
- `src/js/lib/{constants.js,time.js,schedulers.js,storage.js}` – shared utilities

## Run / test
```bash
nvm use
npm install
npm run serve   # http://localhost:8000/ served from src/
npm test        # calculator.js unit tests
npm run format  # Prettier
npm run build   # copy src/ → dist/ (GitHub Pages)
```

## Data + config
- External APIs: Open-Meteo (weather + geocode), SunriseSunset.io (dawn); no API keys.
- Persistence: localStorage only; state saved on each change.
- Caching: weather 1h, geolocation 1m, dawn LRU (50 entries).
- Wetness calibration lives in `src/js/app/weather.js` (clay-rich NJ soil, 7:1 snow ratio).
- Node version pinned via `.nvmrc`.

## Deployment / automation
- GitHub Pages deploy: `.github/workflows/pages.yml` runs `npm ci`, `npm run build`, publishes `dist/` on pushes to `main`.
- Source is served from `src/`; avoid adding build steps or runtime deps.

## Agent guardrails
- Keep vanilla JS + ES modules; no frameworks/bundlers.
- Prefer consolidated modules with `// === SECTION ===` markers.
- Update or add tests only for pure logic (calculator); otherwise verify in browser.
