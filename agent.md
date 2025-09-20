# Wake Time Calculator - Technical Documentation

## Overview
Single-file HTML app that calculates optimal wake time based on meeting schedule, run duration, and location-aware weather conditions. UI styling uses Tailwind + DaisyUI via CDN; there is no build step.

## Project Structure
- **Entry point**: `wake.html` contains the complete UI, styling, and client-side logic
- **Supporting files**:
  - `index.html` (redirect for GitHub Pages)
  - `README.md` (user-facing overview)
  - `package.json` (utility scripts)
  - `.gitignore` (excludes `wake.min.html`, `node_modules/`, etc.)
- **Tech stack**: vanilla HTML/CSS/JS with TailwindCSS + DaisyUI loaded from CDNs; no bundler or build pipeline

## Development Workflow

### Commands
Run these from the repository root:

| Purpose | Command |
| --- | --- |
| Serve locally (Node) | `npm start` → http://localhost:8000/wake.html |
| Serve locally (Python) | `npm run serve` or `python3 -m http.server 8000` |
| Format `wake.html` | `npm run format` |
| HTML validation | `npm run validate` |
| Lightweight smoke check | `npm run smoke` |

Always run `npm run format` and `npm run validate` after making changes to `wake.html`. Execute `npm run smoke` if you modified network calls or markup that could impact loading.

### Guidelines
1. Keep edits narrowly focused on the requested change; avoid broad refactors or introducing new tooling
2. Preserve the single-file architecture—do not add frameworks, build steps, or external asset pipelines
3. Match existing formatting and naming conventions (the file is Prettier-friendly but largely hand-formatted)
4. Prefer `rg`, `sed -n`, or targeted search to navigate `wake.html`; it is long, so avoid full-file rewrites
5. Do not commit `wake.min.html` or `node_modules/` (both are ignored but double-check before committing)

## Key Features

### Core Calculator
- **Fixed prep time**: 45 minutes (non-configurable)
- **Inputs**: First meeting time, run duration, breakfast time, travel time, run location
- **Output**: Wake time (12/24hr format), run start time, breakdown of time components
- **Previous day badge**: Shows when wake time crosses midnight

### Weather Awareness Bar
- **Dawn time**: From SunriseSunset.io API
- **Weather data**: Open-Meteo API (temp, humidity, wind, precipitation)
- **Trail Wetness Score**: Custom algorithm using:
  - 7-day precipitation history with 0.85 daily decay factor
  - ET₀ (evapotranspiration) subtraction at 60% rate
  - Categories: Dry (<0.05"), Moist, Slick, Muddy, Soaked (>0.8")
- **Wind chill**: NWS formula when temp ≤50°F and wind ≥3mph
- **Wet bulb**: Direct from API or Stull approximation fallback

### Data Management
- **LocalStorage keys** (all prefixed with `wake:`):
  - `wake:first` - First meeting time
  - `wake:run` - Run duration
  - `wake:travel` - Travel time
  - `wake:breakfast` - Breakfast duration
  - `wake:location` - Selected run location
  - `wake:lat`, `wake:lon`, `wake:city`, `wake:tz` - Location coordinates
- **Caching**: 15-minute cache for API responses (localStorage + in-memory)
- **Request deduplication**: Uses request ID counter to prevent stale updates
- **Timezone**: Forecast requests use `timezone=auto`; dawn label formats in the location's tz

## Technical Details

### API Endpoints
- **Dawn**: `https://api.sunrisesunset.io/json?lat={lat}&lng={lon}&date=tomorrow`
- **Weather**: `https://api.open-meteo.com/v1/forecast` (hourly + daily data, `timeformat=unixtime`, `timezone=auto`)
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search` (forward)
- **Reverse geocoding**: `https://geocoding-api.open-meteo.com/v1/reverse` with Nominatim fallback

### Units
- **Temperature**: Fahrenheit
- **Wind**: mph
- **Precipitation**: inches
- **ET₀**: mm (converted to inches internally)

### Key Algorithms

#### Trail Wetness Score
```javascript
wetness = Σ(i=0 to n-1) [max(0, rain[i] - 0.6*ET₀[i]) * 0.85^i]
```
Where i=0 is yesterday, going back n days (default 7)

#### Wind Chill (NWS)
```javascript
if (tempF <= 50 && windMph >= 3):
  windChill = 35.74 + 0.6215*T - 35.75*V^0.16 + 0.4275*T*V^0.16
```

### UI/UX Features
- **Responsive design**: Mobile-first with breakpoints at 640px, 520px, 480px
- **Live recalculation**: Form changes update immediately
- **Location auto-sync**: Travel time updates when location changes (if not manually set)
- **Ellipsis truncation**: Long location names truncate with tooltip
- **ARIA labels**: Screen reader support on key elements
- **Headlamp badge**: Simple red badge next to "Run location" when a dirt route is selected (no date/time logic)
- **Clothes at dawn**: Suggestion based on wind chill with optional "+ rain jacket" if PoP ≥ 60% and not snow
- **Visuals**: Boston-flavored hero gradient (optional image via CSS var), glass card, Tailwind/DaisyUI components

## Common Tasks

### Adding a new run location
Add to the appropriate `<optgroup>` in the location select:
```html
<option value="location-id" data-travel="minutes">Location Name</option>
```
For dirt routes, also add the location ID to the `DIRT_LOCATIONS` Set in the JavaScript.

### Adjusting wetness thresholds
Modify the `categorizeWetness` function breakpoints (currently 0.05, 0.20, 0.40, 0.80 inches)

### Changing cache duration
Update `CACHE_DURATION` constant (currently 15 minutes = 900000ms)

## Testing Expectations
There is no automated test suite beyond the npm scripts. Manually verify:
- [ ] Calculator works across midnight boundary
- [ ] Weather loads for both geolocation and manual city entry
- [ ] Wetness score updates with location change
- [ ] Cache prevents excessive API calls
- [ ] Mobile layout remains functional
- [ ] Settings persist after reload
- [ ] Travel time syncs with location selection
- [ ] Headlamp badge only shows for dirt routes (not "No dirt")
- [ ] Awareness bar still renders when geolocation is unavailable

## Common Gotchas
- LocalStorage keys are prefixed with `wake:`; keep names stable to avoid breaking saved data
- The awareness bar caches API responses for 15 minutes—respect `CACHE_DURATION` and existing caching helpers
- Trail wetness categories are consumed in multiple spots (badging + text); adjust both when modifying thresholds
- Tailwind components rely on CDN versions defined in the `<head>` of `wake.html`; keep the order intact when editing

## Resources
- Use `README.md` for high-level project context
- Use `CLAUDE.md` for Claude Code specific instructions
- This file (`agent.md`) for detailed algorithm notes and API references