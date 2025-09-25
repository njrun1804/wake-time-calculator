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

### Default Experience
Load `index.html` (or visit the published site) to land on `index-full-modular.html`, the weather-aware modular build that replaces the monolith.

### Other Entry Points
- **Simple Modular**: Open `index-modular.html` for the streamlined calculator without awareness UI.

### Setup for Development
```bash
# For ES6 module testing
python3 -m http.server 8000
# Then visit http://localhost:8000/index-full-modular.html
```

## Architecture

### File Structure
```
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

Quick setup (clones or Codex web workspaces):

```bash
./scripts/setup.sh
```

```bash
npm run test            # Safari end-to-end suite (index-full-modular by default)
npm run test:modular    # Safari regression for the modular shell
npm run test:full-modular
npm run test:unit       # Node-based unit tests
npm run test:performance
npm run validate:all
```

Tests cover:
- Unit tests for calculator logic
- Integration tests for the modular UI flow (Safari desktop)
- Performance guardrails for the modular entry point

## Development

The application is built with modern ES6 modules requiring no build step. For development:

1. Start a local HTTP server (required for ES6 modules)
2. Edit modules in the `js/` directory
3. Test changes in browser
4. Run test suite to verify functionality

## Live Demo

Visit: [https://njrun1804.github.io/wake-time-calculator/](https://njrun1804.github.io/wake-time-calculator/)
