# Wake Time Calculator - System Architecture

## Overview

Wake Time Calculator is a vanilla JavaScript web application that calculates optimal wake times for runners based on meeting schedules, run duration, and weather conditions. The application uses ES6 modules with no build step, running directly in modern browsers.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (ES6 Modules)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  index.html  │───▶│   main.js    │───▶│ awareness.js │  │
│  │  (Entry)     │    │ (Orchestrator)│    │  (Display)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         │                   ├────────────────────┘          │
│         │                   │                              │
│         │         ┌─────────┴─────────┐                   │
│         │         │                   │                    │
│         │    ┌────▼────┐        ┌────▼────┐              │
│         │    │ weather  │        │ location │              │
│         │    │   .js    │        │   .js    │              │
│         │    └──────────┘        └──────────┘              │
│         │         │                   │                    │
│         │    ┌────▼────┐        ┌────▼────┐              │
│         │    │  dawn.js │        │   lib/  │              │
│         │    └──────────┘        │ (utils) │              │
│         │                        └──────────┘              │
│         │                                                   │
│  ┌──────▼──────────────────────────────────────┐           │
│  │         LocalStorage (Persistence)          │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Open-Meteo   │    │SunriseSunset  │    │  Geolocation │
│  (Weather)   │    │   (Dawn)     │    │   (Browser)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Module Dependencies

### Application Modules (`src/js/app/`)

**main.js** (486 lines) - Application Orchestrator
- Coordinates all modules
- Manages application state
- Handles user input and recalculation
- Persists state to localStorage
- Dependencies: All lib/ modules, all app/ modules

**awareness.js** (805 lines) - Weather Awareness & Display
- Updates UI with weather data
- Manages status icons (OK/Yield/Warning)
- Handles location management
- Tracks state changes for debugging
- Dependencies: weather.js, dawn.js, location.js, ui.js

**weather.js** (1117 lines) - Weather API & Wetness Algorithm
- Open-Meteo API integration (1-hour cache)
- 8-step moisture scoring algorithm
- Trail condition interpretation (7 states)
- NJ coastal climate calibration
- Dependencies: constants.js, time.js

**location.js** (349 lines) - Location Services
- Browser geolocation wrapper (1-min cache)
- Forward geocoding (place → coords)
- Reverse geocoding (coords → place)
- Location formatting utilities
- Dependencies: None (uses Open-Meteo API)

**dawn.js** (211 lines) - Dawn Time Calculations
- SunriseSunset.io API integration
- Daylight checks (headlamp warnings)
- LRU cache (50 entries)
- Dependencies: None

**ui.js** (44 lines) - UI Utilities
- Debounce function
- Location badge display logic
- Dependencies: None

### Library Modules (`src/js/lib/`)

**calculator.js** (132 lines) - Core Wake Time Math
- Pure calculation functions (no side effects)
- Time subtraction logic
- Previous day rollover handling
- Input validation
- Dependencies: time.js

**storage.js** (215 lines) - LocalStorage Management
- JSON serialization wrappers
- User-facing error alerts
- Save/load utilities
- Dependencies: None

**constants.js** (49 lines) - Application Constants
- Default values
- Cache durations
- Timezone utilities
- Dependencies: None

**schedulers.js** (61 lines) - Scheduling Utilities
- `runWhenIdle` for deferred execution
- Performance optimization
- Dependencies: None

**time.js** (47 lines) - Time Manipulation
- Time formatting utilities
- Timezone conversions
- Dependencies: None

## Data Flow

### Application Initialization

```
1. index.html loads
   ↓
2. main.js executes (WakeTimeApp class)
   ↓
3. Element caching → Load saved values → Attach listeners
   ↓
4. runWhenIdle() → Initialize awareness.js
   ↓
5. awareness.js → Initialize location, weather, dawn modules
   ↓
6. Location resolved → Weather fetched → Dawn calculated
   ↓
7. UI updated with all data
```

### Wake Time Calculation Flow

```
User Input (meeting time, run duration, etc.)
   ↓
main.js: debounced recalculation (150ms)
   ↓
calculator.js: calculateWakeTime()
   ↓
Result displayed in UI
   ↓
State saved to localStorage
```

### Weather Awareness Flow

```
awareness.js: init()
   ↓
location.js: getCurrentLocation() (geolocation or manual)
   ↓
weather.js: fetchForecast() (cached 1 hour)
   ↓
weather.js: computeWetness() (7-day lookback)
   ↓
weather.js: interpretWetness() (trail conditions)
   ↓
dawn.js: getDawnTime() (cached LRU)
   ↓
awareness.js: updateUI() (status icons, warnings)
```

## State Management

### Application State

Immutable state object managed by `main.js`:
```javascript
{
  meetingTime: "09:00",
  runDuration: 30,
  travelTime: 15,
  breakfastTime: 20,
  location: { lat, lon, name },
  // ... other fields
}
```

### Persistence

- **Auto-save**: State saved to localStorage on every change
- **Load on init**: Saved values loaded on app startup
- **Error handling**: User-facing alerts if storage fails

### State Updates

- **Debounced recalculation**: 150ms delay to batch rapid changes
- **Immutable updates**: New state object created, not mutated
- **Event-driven**: UI updates triggered by state changes

## API Integration

### Open-Meteo API

**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**Usage**:
- Weather forecasts (temperature, precipitation, wind)
- Geocoding (forward and reverse)
- Free tier, no API key required

**Caching**:
- Weather data: 1 hour
- Geocoding: 1 minute

**Error Handling**:
- Graceful degradation if API unavailable
- Fallback to cached data when possible
- User-facing error messages

### SunriseSunset.io API

**Endpoint**: `https://api.sunrisesunset.io/json`

**Usage**:
- Civil dawn times for location
- Free tier, no API key required

**Caching**:
- LRU cache with 50-entry limit
- Probabilistic cleanup to prevent memory leaks

**Error Handling**:
- Fallback to estimated dawn time
- Cache miss handling

### Browser Geolocation API

**Usage**:
- GPS-based location detection
- User permission required

**Caching**:
- 1 minute cache duration

**Error Handling**:
- Fallback to manual location search
- Permission denied handling
- Timeout handling (30 seconds)

## Caching Strategy

### Weather Data Cache
- **Duration**: 1 hour
- **Key**: Location coordinates + date
- **Storage**: In-memory (module-level variable)
- **Invalidation**: Time-based expiration

### Geolocation Cache
- **Duration**: 1 minute
- **Key**: None (single location)
- **Storage**: In-memory
- **Invalidation**: Time-based expiration

### Dawn Time Cache
- **Type**: LRU (Least Recently Used)
- **Size**: 50 entries
- **Key**: Location coordinates + date
- **Storage**: In-memory Map
- **Cleanup**: Probabilistic cleanup on access

## Performance Optimizations

### Deferred Initialization
- `runWhenIdle()` for non-critical initialization
- Fast first paint, awareness loads after UI ready

### Debouncing
- Input handlers debounced (150ms)
- Prevents excessive recalculations

### Lazy Loading
- Weather awareness initialized after main UI
- Modules loaded on-demand

### Caching
- API responses cached to reduce network calls
- LocalStorage for user preferences

## Error Handling Strategy

### API Failures
- `Promise.allSettled` for parallel operations
- Graceful degradation (show cached data or defaults)
- User-facing error messages

### Validation
- Input validation with descriptive errors
- Type checking for API responses
- Fallback values for missing data

### Storage Failures
- Try/catch around localStorage operations
- User alerts if storage unavailable
- Continue operation without persistence

## Security Considerations

### API Keys
- No API keys required (all APIs are free/public)
- No sensitive data stored

### Input Validation
- All user inputs validated
- Sanitization for display (XSS prevention)

### CORS
- APIs support CORS
- No proxy required

## Browser Compatibility

### Required Features
- ES6 modules (import/export)
- LocalStorage API
- Geolocation API (optional)
- Fetch API

### Supported Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### Fallbacks
- Manual location if geolocation unavailable
- Default values if APIs fail
- Basic functionality works offline (core calculator)

## Deployment Architecture

### GitHub Pages
- Serves `src/` directory directly
- No build step required
- Automatic deployment via GitHub Actions

### Static Hosting
- Any static host works (Netlify, Vercel, Cloudflare Pages)
- No server-side code required
- CORS headers for API access

## Future Architecture Considerations

### Potential Enhancements
- Service worker for offline support
- IndexedDB for larger data storage
- Web Workers for heavy calculations
- Progressive Web App (PWA) features

### Scalability
- Current architecture sufficient for single-user use case
- No backend required
- All processing client-side

---

**Note**: This architecture is optimized for solo development with fast iteration. The consolidated module structure (AI-first design) prioritizes code visibility and maintainability over traditional separation of concerns.

