# Claude Code Instructions

## Project Context
This is a comprehensive wake time calculator for runners with weather awareness, now available in both monolithic and modular architectures. The project demonstrates a complete transformation from a single-file application to a maintainable ES6 modular system.

## Architecture Overview

### Three Versions Available
1. **Monolithic**: `wake.html` - Original 1742-line single file (legacy)
2. **Basic Modular**: `index-modular.html` + `js/main.js` - Core functionality with modules
3. **Full Modular**: `index-full-modular.html` + `js/main-full.js` - Complete functionality including weather awareness

### Module Structure
```
js/
├── core/                    # Core business logic
│   ├── calculator.js        # Time calculations (pure functions)
│   ├── storage.js          # Data persistence & localStorage
│   └── constants.js        # Shared constants & defaults
├── modules/                 # Feature modules
│   ├── weather.js          # Weather API & data processing
│   ├── location.js         # Geocoding & GPS services
│   ├── dawn.js             # Dawn time & daylight calculations
│   ├── awareness.js        # Weather awareness UI
│   └── ui.js              # UI utilities & helpers
├── utils/                  # Utility functions
│   └── time.js            # Time formatting & manipulation
├── main.js                 # Basic modular app orchestration
└── main-full.js           # Full modular app orchestration
```

## Development Guidelines

### Code Style
- **ES6 Modules**: Use native browser modules (no build step)
- **Pure Functions**: Separate business logic from DOM manipulation
- **Module Boundaries**: Clear interfaces between modules
- **No Comments**: Avoid inline comments unless clarifying complex tradeoffs
- **Consistent Patterns**: Follow existing module structure and naming

### Module Design Principles
- **Core modules**: Pure functions, no DOM dependencies
- **Feature modules**: Focused on specific functionality
- **UI modules**: Handle DOM manipulation and user interactions
- **Utils**: Reusable helper functions

### Testing Strategy
```bash
# Run all tests
npx playwright test

# Unit tests (pure functions)
npx playwright test tests/unit/

# Integration tests (full app)
npx playwright test tests/integration/

# HTTP server for ES6 modules
python3 -m http.server 8000
```

## File Structure
```
repo/
├── wake.html                # Legacy monolithic version
├── index.html              # GitHub Pages redirect
├── index-modular.html      # Basic modular demo
├── index-full-modular.html # Complete modular demo
├── css/
│   └── main.css           # Extracted styles
├── js/                    # Modular JavaScript (see above)
├── tests/                 # Playwright test suite
│   ├── unit/             # Pure function tests
│   ├── integration/      # Full app tests
│   └── debug/            # Diagnostic tests
├── package.json          # Test dependencies
├── playwright.config.js  # Test configuration
├── README.md            # Updated documentation
└── CLAUDE.md           # This file
```

## Development Workflows

### Working with Core Logic
```bash
# Edit calculator functions
nano js/core/calculator.js

# Test calculations
npx playwright test tests/unit/calculator.test.js
```

### Adding Weather Features
```bash
# Edit weather module
nano js/modules/weather.js

# Test weather integration
npx playwright test tests/integration/modular.test.js
```

### Working with UI
```bash
# Edit UI utilities
nano js/modules/ui.js

# Edit main orchestration
nano js/main-full.js

# Test in browser
python3 -m http.server 8000
open http://localhost:8000/index-full-modular.html
```

## Common Edits

### Update Run Locations
**Modular**: Edit constants in `js/core/constants.js` and update HTML selects
**Legacy**: Search for `<optgroup label="Dirt by distance">` in `wake.html`

### Adjust Weather Thresholds
**Modular**: Edit `categorizeWetness` function in `js/modules/weather.js`
**Legacy**: Search for `categorizeWetness` function in `wake.html`

### Modify Cache Duration
**Modular**: Edit `CACHE_DURATION` in `js/core/constants.js`
**Legacy**: Search for `CACHE_DURATION` constant in `wake.html`

### Daylight Check Logic
**Modular**: Edit `checkDaylightNeeded` in `js/modules/dawn.js`
**Legacy**: Search for `updateLocationHeadlamp` function in `wake.html`

## Testing & Debugging

### Unit Tests
- Calculator functions: `tests/unit/calculator.test.js`
- Storage functions: `tests/unit/storage.test.js`

### Integration Tests
- Full modular app: `tests/integration/modular.test.js`
- Cross-browser compatibility included

### Debug Functions
```javascript
// Set test dawn time
window.setTestDawn(6, 30);

// Trigger daylight check
window.updateLocationHeadlamp();

// Check current dawn
window.currentDawnDate;
```

## APIs & Services

### Weather & Location (No API Keys Required)
- **Open-Meteo**: Weather data, forecasts, geocoding
- **SunriseSunset.io**: Dawn/sunrise times
- **Browser Geolocation**: Optional GPS detection

### Data Persistence
- **localStorage**: User preferences, location data, API cache
- **Keys**: Prefixed with 'wake:' (e.g., 'wake:meeting', 'wake:run')
- **Cache**: 15-minute duration for API responses

## Architecture Benefits

### Maintainability
- **Separation of Concerns**: Pure functions vs DOM manipulation
- **Module Boundaries**: Clear interfaces and dependencies
- **Testability**: Isolated functions easy to unit test

### Performance
- **Native ES6 Modules**: No build step, browser-optimized
- **Selective Loading**: Load only needed functionality
- **Efficient Caching**: Layered caching strategy

### Development Experience
- **Hot Reload**: Edit and refresh, no compilation
- **Clear Structure**: Easy to locate and modify functionality
- **Comprehensive Tests**: Confident refactoring and changes

## Migration Notes

When migrating functionality from `wake.html` to modules:
1. **Extract pure functions first** → `js/core/`
2. **Group related functionality** → `js/modules/`
3. **Separate DOM logic** → `js/modules/ui.js` or awareness
4. **Update main orchestration** → `js/main-full.js`
5. **Add tests** → `tests/unit/` or `tests/integration/`
6. **Test cross-browser** → `npx playwright test`

This modular architecture maintains all original functionality while providing a maintainable, testable, and extensible foundation for future development.
