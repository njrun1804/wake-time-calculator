# Wake Time Calculator – Agent Handbook

## Overview
The project delivers a wake-time planner for runners with optional weather and daylight awareness. The codebase now favors modular ES modules and reusable styles over the original single-file implementation. All experiences are static, CDN-powered pages that run without a build step.

## Entry Point
- **`index.html`** – Feature-complete modular experience (calculator + weather awareness) served directly for GitHub Pages and local development.

## Repository Layout
```
index.html          → single-page app (calculator + awareness)
css/                → shared styling extracted from the monolith
js/
  app/             → UI orchestrators & helpers (`main.js`, `ui.js`, `awareness.js`, `dawn.js`, `location.js`, `weather.js`)
  lib/             → pure logic, constants, storage, and shared utilities
docs/               → product docs and design notes
playwright.config.js
package.json        → scripts for linting, validation, and Playwright suites
tests/              → Playwright integration, unit, and performance suites
```

Key architectural references:
- **`MIGRATION.md`** chronicles the stepwise extraction from the monolith and explains how responsibilities moved into modules.
- **`README.md`** gives user-facing context for the calculator and its weather-aware mode.
- **`CLAUDE.md`** mirrors this guide for other autonomous agents and includes module dependency notes.

## Core Systems
### Library (`js/lib`)
- `constants.js` defines prep durations, cache windows, default times, and storage key names.
- `calculator.js` provides pure helpers for time conversion, wake-time computation, and formatting.
- `storage.js` wraps `localStorage` with JSON handling, cache timestamps, and a `clear()` helper.
- `time.js` centralizes time zone–aware formatting and ISO parsing.
- `schedulers.js` offers idle callbacks used to defer awareness bootstrapping.

### Application Layer (`js/app`)
- `main.js` hydrates the page, restores persisted state, synchronizes travel times with location changes, and orchestrates awareness subsystems.
- `ui.js` manages dirt-route detection, daylight warning badges, and provides a debounce utility for form interactions.
- `awareness.js` orchestrates weather + dawn lookups, handles DOM updates for the awareness panel, manages cache lifetimes, and persists location metadata.
- `dawn.js` caches sunrise/sunset API results and determines headlamp requirements based on run start.
- `location.js` performs forward/reverse geocoding, browser geolocation, and validation of latitude/longitude ranges.
- `weather.js` fetches Open-Meteo forecasts and precipitation history, applies wind chill and wetness scoring, and exposes display helpers. `computeWetness()` blends rainfall, FAO evapotranspiration (60% drying coefficient), exponential decay (0.85 per day), and temperature-driven snowmelt to produce the awareness panel score and summary text.

## Data & Caching Model
- All persisted values live under `wake:*` keys in `localStorage`. Respect existing key names to avoid breaking saved user data.
- API responses cache for 15 minutes (`CACHE_DURATION` in `constants.js`) with timestamp checks in both memory and storage. Always go through the storage/cache helpers instead of hand-rolling fetches.
- Weather and dawn requests run concurrently with abort controllers and request IDs to prevent stale UI updates; follow this pattern when adding new remote data.

## Development Workflow
### Environment Setup
```bash
npm install
```
Installs Playwright, Prettier, and HTML validator dependencies. Playwright may prompt to install browser binaries (`npx playwright install`).

### Key Commands
| Purpose | Command |
| --- | --- |
| Local static server | `npm run serve` (Python HTTP server on http://localhost:8000/) |
| Run Safari Playwright suite | `npm test` |
| Core planner regression | `npm run test:core` |
| Awareness regression | `npm run test:awareness` |
| Unit tests only | `npm run test:unit` |
| Performance comparison | `npm run test:performance` |
| Prettier check/write (HTML) | `npm run lint` · `npm run format` |
| Prettier check/write (JS) | `npm run lint:js` · `npm run format:js` |
| HTML validation | `npm run validate:html` |
| Combined lint + validate | `npm run validate:all` |

Run the relevant Playwright suite(s) whenever you touch calculator logic, persistence, or UI wiring. Always run `npm run lint:js` (or `format:js`) plus `npm run validate:html` when you edit JavaScript or HTML respectively.

### Editing Guidelines
1. Enhance `index.html` and its app/service modules—that single page is the supported surface.
2. Keep modules focused: add new functionality by extending the relevant file (e.g., weather metrics stay in `weather.js`, display tweaks in `ui.js`).
3. Reuse constants and helpers from `js/lib` rather than duplicating logic.
4. When adding new weather/daylight behaviors, extend `js/app/awareness.js` (and its helpers) before introducing new top-level modules.
5. Avoid introducing bundlers or additional build steps; the project intentionally stays framework-free.
6. Follow existing naming and formatting conventions. Use Prettier via the provided scripts to enforce consistency.

## Common Tasks
- **Add a new location option**: Update the `<select>` in `index.html` and list the location in `DIRT_LOCATIONS` within `js/app/ui.js` when it should trigger headlamp/dirt styling.
- **Adjust trail wetness thresholds**: Update `interpretWetness` in `js/app/weather.js` (and keep `docs/trail-wetness.md` in sync) to refine categorisation.
- **Change prep or cache durations**: Update the relevant constant in `js/lib/constants.js` and audit tests that assert those values.
- **Persist additional fields**: Extend `DEFAULT_STATE` and helper functions in `js/lib/storage.js`, then integrate with entry-point hydration logic.

## Testing Expectations
Before committing changes:
- [ ] Run applicable Playwright tests (full suite for cross-cutting changes, targeted suites for scoped updates).
- [ ] Validate HTML for any touched page.
- [ ] Prettier-check or format modified HTML/JS files.
- [ ] Manually verify weather and daylight panels still render, especially when APIs are unavailable or geolocation is denied.

## Known Gotchas
- Weather/dawn modules rely on request ID sequencing—ensure any new async work follows the same guardrails to avoid race conditions.
- Browser geolocation often fails on non-HTTPS origins; keep graceful fallback messaging intact.
- Storage values feed directly into DOM inputs during hydration. When adding new fields, initialize defaults to avoid `undefined` flashes.
- Tests assume U.S. locale defaults (Fahrenheit, miles). Keep conversions consistent unless intentionally expanding.

## Additional Resources
- **`docs/`** houses deeper dives into UX flows and weather heuristics.
- **`docs/trail-wetness.md`** explains the wetness scoring model and calibration roadmap.
- **`tests/`** examples demonstrate how the app should behave end-to-end; refer to them when scoping new features or bug fixes.
- Use `rg`/`npm run lint:js -- --list-different` for targeted navigation and diff-friendly edits.
