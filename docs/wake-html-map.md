# `wake.html` Maintainability Map

This document highlights the major regions of `wake.html` so future agents can jump to the correct section quickly.

## High-level layout
- **Lines ~1–220** – `<head>`: CDN bootstrapping (Tailwind runtime script, DaisyUI stylesheet) and bespoke CSS including responsive tweaks for the awareness bar and form layout.
- **Lines ~220–420** – Awareness bar markup (`<section id="awareness">`): contains the location controls, the metric grid, inline clothes suggestion, and credits.
- **Lines ~420–620** – Main calculator card: headline output, form inputs, and summary breakdown region.
- **Lines ~620–end** – Single `<script>` block wrapping the entire client logic in an IIFE. All JS lives here.

> Tip: use `sed -n '600,800p' wake.html` (adjust numbers) to peek at targeted script slices without loading the whole file.

## Awareness bar quick reference
Key element IDs (search for each when editing):

| ID | Purpose |
| --- | --- |
| `awCity` | Badge showing the resolved location label. Class switched between success/warning. |
| `awDawn` | `<time>` element for tomorrow’s dawn, formatted in the location time zone. |
| `awWindChill` | Displays wind chill (or fallback temperature). Adds `.bad` class when ≤ 15 °F. |
| `awPoP` | Precipitation probability. Adds `.bad` when ≥ 60 %. |
| `awWetBulb` | Wet-bulb temperature. Adds `.bad` when ≥ 75 °F. |
| `awWetness` | Trail wetness category + numeric inch value when available. `.bad` when ≥ 0.40". |
| `awMsg` | Status line communicating loading/errors. |
| `useMyLocation` / `setPlace` / `placeQuery` | Controls for geolocation + manual city lookup. |
| `clothesInline` | Inline text for “Clothes at dawn” suggestion. |

## Script structure
Inside the closing `<script>` block:

1. **Constants & utilities**
   - `PREP_MINUTES`, `MINUTES_PER_DAY`, time conversion helpers (`toMinutes`, `fromMinutes`, `format12`, etc.).
   - Location defaults and the `DIRT_LOCATIONS` set for the headlamp badge logic.
2. **DOM caches**
   - `elements` – references to form fields, outputs, and stateful containers.
   - `wels` – references used exclusively by the awareness bar UI.
3. **Persistence helpers**
   - `storageKeys`, `loadValues()`, `saveValues()` for calculator state.
   - `weatherStorage`, `readCoords()`, `saveCoords()` for awareness-bar state.
4. **Scheduling logic**
   - `recalculate()` calculates wake time totals and updates the summary via `renderResult()` / `showEmptyState()`.
5. **Weather + dawn fetching**
   - `fetchWithCache()` implements the 15-minute cache shared by dawn, weather, and wetness requests.
   - `fetchDawn()`, `fetchWeatherAround()`, `fetchWetnessInputs()`, `computeWetness()`, `categorizeWetness()` handle API calls and derived metrics.
   - `reverseGeocode()` falls back to Nominatim when Open-Meteo reverse lookup fails.
6. **Awareness rendering**
   - `renderAwareness()` updates the DOM, toggling `.bad` threshold classes and the run-location headlamp badge via `updateLocationHeadlamp()`.
   - `refreshAwareness()` orchestrates API calls with request-id deduping and abort control.
   - `attachAwarenessEvents()` wires geolocation + manual search buttons.
   - `initAwareness()` bootstraps the bar with cached coords or fresh geolocation.
7. **Event wiring**
   - `attachEvents()` sets up `input` listeners for recalculation, travel override toggles, and ensures travel time syncs with the selected location option.
   - DOM ready guard kicks off `loadValues()`, `attachEvents()`, `recalculate()`, `initAwareness()`, and `updateLocationHeadlamp()`.

## Useful search anchors
- `<!-- Tailwind runtime CDN` – start of `<head>` block.
- `<section class="awareness"` – awareness markup anchor.
- `const PREP_MINUTES` – start of script constants.
- `const weatherStorage = {` – beginning of weather persistence helpers.
- `const refreshAwareness = async` – main orchestrator for weather updates.
- `const recalculate = () => {` – calculator computation logic.

Keeping these anchors handy makes it easier to insert new functionality without disrupting the rest of the monolithic file.
