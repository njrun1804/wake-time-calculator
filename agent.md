# Wake Time Calculator – Agent Handbook

## Overview
The project delivers a wake-time planner for runners with optional weather and daylight awareness. The codebase now favors modular ES modules and reusable styles over the original single-file implementation. All experiences are static, CDN-powered pages that run without a build step.

## Application Variants
- **`wake.html`** – Legacy single-file page kept for regression protection. Avoid editing unless a change must ship to the legacy experience.
- **`index-modular.html`** – Core modular page that pulls shared CSS/JS from the `css/` and `js/` directories.
- **`index-full-modular.html`** – Feature-complete experience with weather, daylight, geolocation, and awareness panel. This is the primary target for new work.
- **`index.html`** – Redirect for GitHub Pages hosting.

## Repository Layout
```
css/                → shared styling extracted from the monolith
js/
  core/            → business logic, constants, and persistence helpers
  modules/         → feature modules (weather, dawn, location, UI orchestration)
  utils/           → shared time utilities
  main.js          → entry point for `index-modular.html`
  main-full.js     → entry point for `index-full-modular.html`
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
### Calculator (`js/core`)
- `constants.js` defines prep durations, cache windows, default times, and storage key names.
- `calculator.js` provides pure helpers for time conversion, wake-time computation, and formatting.
- `storage.js` wraps `localStorage` with JSON handling, cache timestamps, and a `clear()` helper.

### Utilities (`js/utils`)
- `time.js` centralizes time zone–aware formatting and ISO parsing.
- Weather-related conversions now live directly in `js/modules/weather.js` after retiring the unused `conversions.js` helper.

### Feature Modules (`js/modules`)
- `weather.js` fetches Open-Meteo forecasts and precipitation history, applies wind chill and wetness scoring, and exposes display helpers.
- `dawn.js` caches sunrise/sunset API results and determines headlamp requirements based on run start.
- `location.js` performs forward/reverse geocoding, browser geolocation, and validation of latitude/longitude ranges.
- `awareness.js` orchestrates weather + dawn lookups, handles DOM updates for the awareness panel, manages cache lifetimes, and persists location metadata.
- `ui.js` wires DOM interactions, debounced form updates, dirt-route highlighting, and shared formatting helpers.

### Entry Points
- `js/main.js` hydrates the core modular page: caches DOM elements, restores persisted state, and wires basic calculator listeners.
- `js/main-full.js` does the same plus initializes the awareness subsystem, synchronizes travel times with location changes, and manages daylight warnings.

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
| Run full Playwright suite | `npm test` |
| Variant test runs | `npm run test:legacy` · `npm run test:modular` · `npm run test:full-modular` |
| Unit tests only | `npm run test:unit` |
| Performance comparison | `npm run test:performance` |
| Prettier check/write (HTML) | `npm run lint` · `npm run format` |
| Prettier check/write (JS) | `npm run lint:js` · `npm run format:js` |
| HTML validation | `npm run validate:html` |
| Combined lint + validate | `npm run validate:all` |

Run the relevant Playwright suite(s) whenever you touch calculator logic, persistence, or UI wiring. Always run `npm run lint:js` (or `format:js`) plus `npm run validate:html` when you edit JavaScript or HTML respectively.

### Editing Guidelines
1. Prefer enhancing the modular pages (`index-modular.html`, `index-full-modular.html`) and their modules. Touch `wake.html` only for parity-critical fixes.
2. Keep modules focused: add new functionality by extending the relevant file (e.g., weather metrics stay in `weather.js`, display tweaks in `ui.js`).
3. Reuse constants and helpers from `js/core` and `js/utils` rather than duplicating logic.
4. Avoid introducing bundlers or additional build steps; the project intentionally stays framework-free.
5. Follow existing naming and formatting conventions. Use Prettier via the provided scripts to enforce consistency.

## Common Tasks
- **Add a new location option**: Update the `<select>` in `index-full-modular.html` (and legacy page if parity is required) and list the location in `DIRT_LOCATIONS` within `js/modules/ui.js` when it should trigger headlamp/dirt styling.
- **Adjust trail wetness thresholds**: Modify `categorizeWetness` in `js/modules/weather.js` and ensure the awareness panel copy stays aligned.
- **Change prep or cache durations**: Update the relevant constant in `js/core/constants.js` and audit tests that assert those values.
- **Persist additional fields**: Extend `DEFAULT_STATE` and helper functions in `js/core/storage.js`, then integrate with entry-point hydration logic.

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
- **`tests/`** examples demonstrate how the app should behave end-to-end; refer to them when scoping new features or bug fixes.
- Use `rg`/`npm run lint:js -- --list-different` for targeted navigation and diff-friendly edits.
