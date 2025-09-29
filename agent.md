# Wake Time Calculator – Agent Handbook

## Overview

Wake Time Calculator is a vanilla JavaScript web application that helps runners plan optimal wake times based on weather conditions. The application provides personalized recommendations by analyzing weather forecasts, dawn times, and run durations.

## Environment & Dependencies

- Served as plain ES modules from `index.html`; no bundler or build step
- Development server is Python `http.server` via `npm run serve`
- No environment variables or API keys required (Open-Meteo and SunriseSunset.io are keyless)
- Project dependencies live in dev-only tooling (Playwright, Prettier, Husky, html-validate)

## Entry Point

- **`index.html`** – Single-page application with full weather awareness served directly without build steps

## Repository Layout

```
index.html          → Main application (calculator + awareness)
css/
  main.css          → Application styles
js/
  app/              → Application modules (main, ui, awareness, weather, dawn, location)
  lib/              → Utility libraries (calculator, storage, constants, time, schedulers)
tests/              → Playwright integration, unit, and performance tests
docs/               → Project documentation
scripts/            → Development utilities
```

Key documentation:
- **`CLAUDE.md`** – Comprehensive developer documentation
- **`README.md`** – User-facing project overview
- **`MIGRATION.md`** – Historical migration notes

## Core Systems

### Library (`js/lib`)

- **`constants.js`** – Application constants (prep durations, cache windows, storage keys)
- **`calculator.js`** – Core wake time calculation logic
- **`storage.js`** – LocalStorage wrapper with JSON handling and caching
- **`time.js`** – Time formatting and manipulation utilities
- **`schedulers.js`** – Deferred execution helpers

### Application Layer (`js/app`)

- **`main.js`** – Entry point, initialization, and state management
- **`ui.js`** – UI components and user interaction handling
- **`awareness.js`** – Weather awareness orchestration
- **`dawn.js`** – Sunrise/sunset calculations and daylight checks
- **`location.js`** – Geolocation and geocoding services
- **`weather.js`** – Weather API integration and condition analysis

### Weather Intelligence

The weather system (`weather.js`) provides:
- Open-Meteo API integration for forecasts
- Trail wetness scoring using precipitation history
- Wind chill calculations
- Temperature-based recommendations
- Color-coded safety indicators (green/yellow/red)

## Data & Caching

- LocalStorage keys use `wake:*` prefix
- API responses cache for 15 minutes
- Concurrent requests use abort controllers
- Request IDs prevent race conditions

## Development Workflow

### Setup
```bash
npm install              # Install dependencies
npm run serve           # Start dev server (port 8000)
```

### Testing
```bash
npm test                # Full test suite
npm run test:unit       # Unit tests only
npm run test:core       # Core functionality
npm run test:awareness  # Weather features
npm run test:performance # Performance metrics
```

### Code Quality
```bash
npm run lint            # Check formatting
npm run format          # Auto-format code
npm run validate:html   # Validate HTML
npm run validate:all    # All validations
```

## Common Tasks

### Add Location Option
1. Update `<select>` in `index.html`
2. Add to `DIRT_LOCATIONS` in `ui.js` if applicable

### Adjust Weather Thresholds
1. Modify `interpretWetness()` in `weather.js`
2. Update `docs/trail-wetness.md` documentation

### Add Persistent Field
1. Extend `DEFAULT_STATE` in `storage.js`
2. Update hydration logic in `main.js`

## Testing Requirements

Before committing:
- [ ] Run relevant test suites
- [ ] Validate HTML changes
- [ ] Format code with Prettier
- [ ] Test with network throttling
- [ ] Verify offline functionality

## Best Practices

1. **Module Focus** – Keep modules single-purpose
2. **No Build Steps** – Maintain vanilla JS approach
3. **Progressive Enhancement** – Core works without APIs
4. **Error Handling** – Graceful degradation for all features
5. **Cache Management** – Respect cache durations
6. **Code Style** – Use Prettier for consistency

## API Integration

### Open-Meteo Weather
- No API key required
- Hourly forecasts
- Historical precipitation
- Automatic caching

### SunriseSunset.io
- Dawn/dusk times
- No authentication
- Location-based queries

### Browser Geolocation
- Optional enhancement
- Fallback to IP location
- User permission required

## Known Issues

- Geolocation requires HTTPS
- Safari may block some APIs
- Cache invalidation on errors
- Time zone edge cases

## Performance Targets

- Initial load < 2s
- API response < 1s
- 60 FPS animations
- Minimal reflows

## Resources

- `docs/trail-wetness.md` – Wetness algorithm details
- `docs/page-test-coverage.md` – Test mapping
- `docs/quality-signals.md` – Quality metrics
- `docs/dev-setup.md` – Environment setup
