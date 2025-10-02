# Wake Time Calculator

A weather-aware wake time calculator for runners. Calculates optimal wake times based on your first meeting, run duration, and weather conditions to help you plan the perfect morning run.

## Features

### Core Functionality
- **Wake Time Calculation**: Determines when to wake up based on meeting time and activities
- **Activity Planning**: Accounts for running, travel time, breakfast, and 45-minute prep time
- **Multiple Time Displays**: Shows wake time, latest wake, and run start time
- **Previous Day Support**: Handles scenarios where you need to wake up the previous day
- **Time Allocation Visualization**: Interactive bars showing time breakdown

### Weather Awareness
- **Dawn Time Tracking**: Fetches tomorrow's dawn time for your location
- **Weather Data**: Temperature, wind, precipitation probability, and conditions
- **Surface Conditions**: Analyzes recent precipitation for trail wetness
- **Daylight Warnings**: Alerts when runs start before dawn
- **Location Services**: GPS-based location detection and manual search

### Technical Features
- **Modular Architecture**: Clean ES6 modules with no build step required
- **Persistent Storage**: Saves preferences and location data
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Core**: Basic functionality works without internet
- **API Integration**: Open-Meteo for weather, SunriseSunset.io for dawn times

## Usage

### Default Experience
Load `index.html` (or visit the published site) for the full weather-aware modular build.

### Setup for Development
```bash
# For ES6 module testing
python3 -m http.server 8000
# Then visit http://localhost:8000/
```

## Architecture

### File Structure
```
├── index.html               # Main application
├── css/
│   └── main.css             # Application styles
├── js/
│   ├── app/                 # Application modules
│   │   ├── main.js          # Entry point & initialization
│   │   ├── ui.js            # UI components & interactions
│   │   ├── awareness/       # Weather awareness modules
│   │   ├── dawn/            # Dawn time calculation modules
│   │   ├── location/        # Location service modules
│   │   ├── main/            # Main orchestration modules
│   │   └── weather/         # Weather API & analysis modules
│   └── lib/                 # Utility libraries
│       ├── calculator.js    # Core wake time calculations
│       ├── storage.js       # Local storage management
│       ├── constants.js     # Application constants
│       ├── schedulers.js    # Scheduling utilities
│       └── time.js          # Time manipulation utilities
├── tests/                   # Test suites
│   ├── integration/         # Integration tests
│   ├── unit/                # Unit tests
│   ├── visual/              # Visual regression tests
│   └── performance/         # Performance tests
└── docs/                    # Documentation
    ├── architecture/        # Architecture docs
    ├── development/         # Development guides
    └── archive/             # Historical docs

### Module Dependencies
```
app/main.js
├── lib/ (calculator, storage, constants, schedulers, time)
├── app/awareness/ (weather awareness orchestration & display)
├── app/weather/ (API, forecasts, wetness scoring, analysis)
├── app/dawn/ (API, astronomy, daylight checks)
├── app/location/ (geocoding, geolocation, validation)
├── app/main/ (app orchestration, state, persistence)
└── app/ui.js (UI utilities)
```

## APIs Used

- **Open-Meteo**: Weather data and geocoding (free, no API key required)
- **SunriseSunset.io**: Dawn/sunrise times (free, no API key required)
- **Browser Geolocation**: Optional GPS location detection

## Testing

Quick setup (clones or Codex web workspaces):

```bash
./scripts/setup.sh
```

```bash
npm run test            # Safari end-to-end suite (all flows)
npm run test:core       # Core planner regression
npm run test:awareness  # Weather awareness regression
npm run test:unit       # Node-based unit tests
npm run test:performance
npm run validate:all
```

Tests cover:
- Unit tests for calculator logic
- Integration tests for the modular UI flow (Safari desktop)
- Performance guardrails for the modular entry point

### Local hooks & CI parity

- **Pre-commit**: Husky + lint-staged run Prettier on staged HTML/JS before every commit.
- **Pre-push**: Husky checks formatting (`prettier --check`) and runs `npm run test:unit` before allowing pushes.
- **CI**: GitHub Actions enforces `npm run validate:all`, the WebKit Playwright suite (`npm test -- --grep "@core|@full|@performance"`), and a `script-sanity` guard that fails if helper scripts (other than `setup-dev.sh`) hide errors with `|| true`.

## Development

The application is built with modern ES6 modules requiring no build step. For development:

1. Start a local HTTP server (required for ES6 modules)
2. Edit modules in the `js/` directory
3. Test changes in browser
4. Run test suite to verify functionality

## Documentation

- `CLAUDE.md` – Comprehensive developer documentation with architecture details
- `docs/architecture/trail-wetness.md` – Trail condition scoring algorithm and calibration
- `docs/development/testing.md` – Test coverage mapping for all features
- `docs/development/quality-standards.md` – Quality gates and performance budgets
- `docs/development/setup.md` – Development environment setup guide

## Live Demo

Visit: [https://njrun1804.github.io/wake-time-calculator/](https://njrun1804.github.io/wake-time-calculator/)
