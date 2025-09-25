# Wake Time Calculator

A comprehensive wake time calculator for runners with weather awareness and modular architecture. Calculates optimal wake times based on your first meeting, run duration, travel time, and breakfast preferences.

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

### Basic Version
Open `wake.html` in your browser for the original single-file version.

### Modular Versions
- **Simple Modular**: Open `index-modular.html` - core functionality with modular architecture
- **Full Modular**: Open `index-full-modular.html` - complete functionality including weather awareness

### Setup for Development
```bash
# For ES6 module testing (required for modular versions)
python3 -m http.server 8000
# Then visit http://localhost:8000/index-modular.html
```

## Architecture

### File Structure
```
├── wake.html                 # Original monolithic version
├── index-modular.html        # Basic modular version
├── index-full-modular.html   # Complete modular version
├── css/
│   └── main.css             # Extracted styles
├── js/
│   ├── core/                # Core functionality
│   │   ├── calculator.js    # Time calculations
│   │   ├── storage.js       # Data persistence
│   │   └── constants.js     # Shared constants
│   ├── modules/             # Feature modules
│   │   ├── weather.js       # Weather data & processing
│   │   ├── location.js      # Geocoding & GPS
│   │   ├── dawn.js          # Dawn time & daylight checks
│   │   ├── awareness.js     # Weather awareness UI
│   │   └── ui.js           # UI utilities
│   ├── utils/              # Utility functions
│   │   └── time.js         # Time formatting
│   ├── main.js             # Basic app orchestration
│   └── main-full.js        # Full app orchestration
└── tests/                  # Playwright test suite
    ├── integration/
    └── unit/
```

### Module Dependencies
```
main-full.js
├── core/ (calculator, storage, constants)
├── modules/ (weather, location, dawn, awareness, ui)
└── utils/ (time)
```

## APIs Used

- **Open-Meteo**: Weather data and geocoding (free, no API key required)
- **SunriseSunset.io**: Dawn/sunrise times (free, no API key required)
- **Browser Geolocation**: Optional GPS location detection

## Testing

Install dependencies and the WebKit binary once per clone when you only need Safari coverage:

```bash
npm install
npx playwright install webkit
```

> **Need the full Chromium/Firefox/WebKit matrix?** Continue to run `npx playwright install --with-deps` to grab every browser plus the system dependencies Playwright expects for Linux CI images.

Then run the available suites. The Playwright configuration respects a `PLAYWRIGHT_BROWSERS` environment variable so you can
target a specific subset (for example `PLAYWRIGHT_BROWSERS=chromium npm run test:e2e`).

```bash
# Playwright regression matrix across Chromium/Firefox/WebKit
npm run test

# WebKit-only regression matrix (lean install for Safari-centric debugging)
npm run test:safari

# Focus on browser flows tagged with @modular
npm run test:modular

# Restrict @modular flows to WebKit for Safari validation
npm run test:modular:safari

# Execute pure logic tests with Node's built-in runner
npm run test:unit

# Quick performance probe (single-browser budget check, defaults to WebKit)
npm run test:performance

# Run the performance suite in another browser as needed
PLAYWRIGHT_BROWSERS=chromium npm run test:performance

# Structural HTML validation + linting + unit tests
npm run validate:all
```

Tests cover:
- Unit tests for calculator logic
- Integration tests for the modular UI flow
- Cross-browser compatibility via Playwright projects

## Development

The application is built with modern ES6 modules requiring no build step. For development:

1. Start a local HTTP server (required for ES6 modules)
2. Edit modules in the `js/` directory
3. Test changes in browser
4. Run test suite to verify functionality

## Live Demo

Visit: [https://njrun1804.github.io/wake-time-calculator/](https://njrun1804.github.io/wake-time-calculator/)
