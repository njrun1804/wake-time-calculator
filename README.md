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

## Quality Checks

Automation spans formatting, structural validation, unit logic, and Playwright flows. Use the matrix below to pick the right signal for your change:

| Command | Tooling | Quality signal provided |
| --- | --- | --- |
| `npm test` | `playwright test` (Chromium/Firefox/WebKit matrix) | Full end-to-end regression across legacy and modular entry points. |
| `npm run test:unit` | `node --test` running `tests/unit/` | Verifies calculator math, storage helpers, and supporting utilities. |
| `npm run test:modular` | Playwright against `index-modular.html` | Exercises the core modular UI without the awareness stack. |
| `npm run test:full-modular` | Playwright against `index-full-modular.html` | Covers weather, dawn, and awareness flows for the complete experience. |
| `npm run test:performance` | Playwright performance probe | Guards the modular load budget (< 8 s DOMContentLoaded). |
| `npm run validate:all` | Prettier + html-validate + unit suite | Formatting, HTML structure, and logic sanity in one shot. |
| `npm run serve` | `python3 -m http.server 8000` | Local preview only (no automated checks). |

Pair one of the focused suites with `npm run validate:all` before sending a pull request to match the project’s documentation promises.

## Development

The application is built with modern ES6 modules requiring no build step. For development:

1. Start a local HTTP server (required for ES6 modules)
2. Edit modules in the `js/` directory
3. Test changes in browser

## Live Demo

Visit: [https://njrun1804.github.io/wake-time-calculator/](https://njrun1804.github.io/wake-time-calculator/)
