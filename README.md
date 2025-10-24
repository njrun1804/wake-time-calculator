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
Visit the published site at https://njrun1804.github.io/wake-time-calculator/ for the full weather-aware application.

For local development, use `npm run serve` (requires Node.js >= 20.19.0) and navigate to http://localhost:8000/

### Setup for Development

**Prerequisites:**
- Node.js >= 20.19.0 (use `nvm use` to automatically switch to the correct version)
- npm >= 10.0.0

```bash
# Use correct Node version (if using nvm)
nvm use

# Install dependencies
npm install

# Serve from src/ directory for ES6 module testing
npm run serve
# Then visit http://localhost:8000/
```

## Architecture

### File Structure
```
├── src/                     # Application source code
│   ├── index.html           # Main application
│   ├── css/
│   │   └── main.css         # Application styles
│   └── js/
│       ├── app/             # Application modules (AI-first consolidated)
│       │   ├── awareness.js # Weather awareness (805 lines)
│       │   ├── dawn.js      # Dawn time calculations (211 lines)
│       │   ├── location.js  # Location services (349 lines)
│       │   ├── main.js      # App orchestration (486 lines)
│       │   ├── ui.js        # UI utilities (44 lines)
│       │   └── weather.js   # Weather API and wetness (1117 lines)
│       └── lib/             # Utility libraries
│           ├── calculator.js    # Core wake time calculations
│           ├── storage.js       # Local storage management
│           ├── constants.js     # Application constants
│           ├── schedulers.js    # Scheduling utilities
│           └── time.js          # Time manipulation utilities
├── tests/                   # Test suite (minimal for solo dev)
│   └── unit/                # Unit tests
│       └── lib/             # Library tests only
│           └── calculator.test.js
└── docs/                    # Documentation

### Module Dependencies
```
app/main.js
├── lib/ (calculator, storage, constants, schedulers, time)
├── app/awareness.js (weather awareness orchestration & display)
├── app/weather.js (API, forecasts, wetness scoring, analysis)
├── app/dawn.js (API, astronomy, daylight checks)
├── app/location.js (geocoding, geolocation, validation)
└── app/ui.js (UI utilities)
```

## APIs Used

- **Open-Meteo**: Weather data and geocoding (free, no API key required)
- **SunriseSunset.io**: Dawn/sunrise times (free, no API key required)
- **Browser Geolocation**: Optional GPS location detection

## Testing

The project uses **minimal testing** optimized for solo development:

```bash
npm test  # Runs unit tests for calculator.js
```

- **Unit Tests**: Calculator logic only (7 tests)
  - `tests/unit/lib/calculator.test.js`: Wake time calculations
  - Tests core math functions: toMinutes, fromMinutes, format12, calculateWakeTime

**Testing Philosophy:**
- Manual testing by user for features/UI
- Automated tests only for pure math (calculator)
- Claude verifies code correctness through reading/analysis
- Fast iteration > comprehensive automation

## Development

The application is built with modern ES6 modules requiring no build step. For development:

1. Start a local HTTP server (required for ES6 modules): `npm run serve`
2. Edit modules in the `src/js/` directory
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
