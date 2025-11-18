# Agent Guide for Wake Time Calculator

This document provides essential information for AI agents working with the Wake Time Calculator codebase.

## Quick Start

**Project Type:** Vanilla JavaScript web application (ES6 modules, no build step)  
**Primary Purpose:** Weather-aware wake time calculator for runners  
**Development Server:** `npm run serve` (serves from `src/` on port 8000)  
**Testing:** `npm test` (minimal unit tests for calculator.js only)

## Codebase Structure

### Core Application Files
```
src/
├── index.html              # Main HTML entry point
├── css/main.css           # Application styles
└── js/
    ├── app/               # Application modules (consolidated, AI-first)
    │   ├── main.js        # App orchestration (486 lines)
    │   ├── awareness.js   # Weather awareness & display (805 lines)
    │   ├── weather.js     # Weather API & wetness algorithm (1117 lines)
    │   ├── location.js    # Location services (349 lines)
    │   ├── dawn.js        # Dawn time calculations (211 lines)
    │   └── ui.js          # UI utilities (44 lines)
    └── lib/               # Utility libraries
        ├── calculator.js  # Core wake time math (132 lines)
        ├── storage.js     # LocalStorage management (215 lines)
        ├── constants.js   # App constants (49 lines)
        ├── schedulers.js   # Deferred execution (61 lines)
        └── time.js        # Time utilities (47 lines)
```

### Documentation
- `README.md` - User-facing project overview
- `CLAUDE.md` - Comprehensive developer documentation
- `docs/trail-wetness.md` - Trail condition algorithm details
- `AGENT.md` - This file (agent-specific guidance)

## Architectural Constraints

### Critical Rules
1. **No Build Step**: Code runs directly as ES6 modules. Do not introduce bundlers, transpilers, or build tools.
2. **Vanilla JavaScript Only**: No frameworks (React, Vue, Angular). Use native DOM APIs.
3. **Consolidated Modules**: Related code lives in single files (e.g., all weather logic in `weather.js`). Do not fragment into subdirectories.
4. **Section Markers**: Use `// === SECTION NAME ===` comments to organize code within large files.
5. **No External Runtime Dependencies**: All code must work in browser without npm packages at runtime.

### Module Organization Philosophy
- **AI-First Design**: Large consolidated files (500-1100 lines) are preferred over many small files
- **Related Code Together**: All weather logic in `weather.js`, all location logic in `location.js`
- **Clear Sections**: Use comment markers to navigate within files
- **Inline Documentation**: JSDoc with examples, data flow, cross-references

## Modification Guidelines

### When to Modify Which Files

**Weather/Wetness Logic:**
- File: `src/js/app/weather.js`
- When: Changing wetness thresholds, drying coefficients, API integration
- Verification: Cross-reference `interpretWetness` outputs with `docs/trail-wetness.md`
- Note: Calibrated for Monmouth County, NJ (7:1 snow ratio, clay-rich soil)

**Weather Display/Awareness:**
- File: `src/js/app/awareness.js`
- When: Changing UI updates, status icons, location management
- Verification: Manual browser testing, check localStorage persistence

**Core Wake Time Calculation:**
- File: `src/js/lib/calculator.js`
- When: Changing wake time math, time formatting
- Verification: Run `npm test` (unit tests exist for this file)

**App Orchestration:**
- File: `src/js/app/main.js`
- When: Changing app lifecycle, state management, event handlers
- Verification: Manual testing, check state persistence

**Location Services:**
- File: `src/js/app/location.js`
- When: Changing geocoding, geolocation, location formatting
- Verification: Test with browser geolocation, manual search

**Dawn Calculations:**
- File: `src/js/app/dawn.js`
- When: Changing dawn API integration, daylight checks
- Verification: Test with different locations, check cache behavior

### Code Quality Standards

1. **Input Validation**: Always validate inputs with descriptive error messages
2. **Error Handling**: Use `Promise.allSettled` for parallel operations, graceful degradation
3. **Memory Management**: Clean up timeouts, event listeners, cache limits (LRU eviction)
4. **Performance**: Use `runWhenIdle` for non-critical initialization
5. **Constants**: Extract magic numbers to named constants with comments
6. **DRY**: Extract repeated logic to helper functions
7. **Comments**: Explain "why" for non-obvious decisions, include examples

### Adding New Features

1. **Choose Module**: Add to existing consolidated module or create new `.js` file
2. **Add Section Marker**: Use `// === SECTION NAME ===` for navigation
3. **Document Inline**: JSDoc with examples, data flow, cross-references
4. **Import/Export**: Add to module exports, import in `main.js` or consumers
5. **Update UI**: Add HTML in `index.html`, styles in `css/main.css`
6. **Manual Test**: Load app, verify functionality
7. **Add Unit Test**: Only if pure math/logic (like `calculator.js`)
8. **Update Documentation**: Add to `CLAUDE.md` Key Components if significant

## Testing Philosophy

### Minimal Testing Approach
- **Automated Tests**: Only for pure math functions (`calculator.js`)
- **Manual Testing**: User tests features/UI manually
- **AI Verification**: Code correctness verified through reading/analysis
- **Fast Iteration**: Prioritize speed over comprehensive automation

### Running Tests
```bash
npm test  # Runs calculator.test.js (7 tests)
```

### What NOT to Test
- ❌ Integration tests (manual testing preferred)
- ❌ Visual regression tests (AI can verify UI)
- ❌ Performance tests (not needed for single user)
- ❌ Complex test infrastructure (Playwright, fixtures, mocks)

## Common Tasks

### Adding a Weather Feature
1. Modify `src/js/app/weather.js` (add section marker)
2. Update `src/js/app/awareness.js` if UI changes needed
3. Test in browser with real weather data
4. Update `docs/trail-wetness.md` if algorithm changes

### Modifying Wake Time Logic
1. Modify `src/js/lib/calculator.js`
2. Run `npm test` to verify
3. Test edge cases (previous day rollover, midnight boundaries)
4. Update `CLAUDE.md` if significant changes

### Changing UI/Display
1. Modify `src/js/app/awareness.js` or `src/js/app/main.js`
2. Update `src/index.html` for HTML changes
3. Update `src/css/main.css` for styling
4. Test responsive design (mobile/desktop)

### Updating API Integration
1. Modify relevant module (`weather.js`, `dawn.js`, `location.js`)
2. Check API rate limits, caching behavior
3. Test error handling (network failures, invalid responses)
4. Verify graceful degradation

## Verification Protocols

### Before Committing Changes

1. **Code Review Checklist:**
   - [ ] No build tools introduced
   - [ ] Vanilla JavaScript only (no frameworks)
   - [ ] Related code in same file (not fragmented)
   - [ ] Section markers added for large changes
   - [ ] Input validation added
   - [ ] Error handling implemented
   - [ ] Memory leaks prevented (timeouts cleaned up)

2. **Testing Checklist:**
   - [ ] Run `npm test` (if calculator.js modified)
   - [ ] Manual browser testing
   - [ ] Test error cases (network failures, invalid inputs)
   - [ ] Verify localStorage persistence
   - [ ] Check mobile responsiveness

3. **Documentation Checklist:**
   - [ ] Update `CLAUDE.md` if architecture changes
   - [ ] Update `docs/trail-wetness.md` if wetness algorithm changes
   - [ ] Update `README.md` if features change
   - [ ] Add JSDoc comments for new functions

### Cross-Reference Verification

**Weather Algorithm Changes:**
- Verify thresholds match `docs/trail-wetness.md`
- Check `interpretWetness` function outputs
- Confirm NJ calibration values (7:1 snow ratio, clay-rich thresholds)

**Calculator Changes:**
- Run unit tests: `npm test`
- Verify edge cases (previous day, midnight boundaries)
- Check time formatting consistency

**API Integration Changes:**
- Test with real API calls
- Verify caching behavior
- Check error handling paths
- Test offline/network failure scenarios

## Key Constants & Calibrations

### NJ Coastal Climate Calibration (Monmouth County)
- **Snow Ratio**: 7:1 (SNOW_TO_WATER_RATIO = 0.143)
- **Drying Coefficients**:
  - Base: 0.5
  - Summer (Jun-Aug): 0.75/day
  - Winter (Nov-Mar): 0.92/day
  - Spring/Fall: 0.85/day
- **Moisture Thresholds** (clay-rich soil):
  - Soaked: >0.5" in 24h
  - Muddy: >0.35" in 48h
  - Slick: >0.20" in 72h
  - Heavy event: ≥1.0"

### API Endpoints
- **Open-Meteo**: `https://api.open-meteo.com/v1/forecast` (weather, geocoding)
- **SunriseSunset.io**: `https://api.sunrisesunset.io/json` (dawn times)
- **Cache Duration**: 1 hour for weather, 1 minute for geolocation, LRU for dawn (50 entries)

## Development Workflow

1. **Start Server**: `npm run serve`
2. **Open Browser**: http://localhost:8000/
3. **Make Changes**: Edit files in `src/`
4. **Test**: Refresh browser, verify functionality
5. **Format Code**: `npm run format` (Prettier)
6. **Run Tests**: `npm test` (if calculator.js changed)
7. **Update Docs**: Update relevant markdown files

## Common Patterns

### Deferred Initialization
```javascript
import { runWhenIdle } from '../lib/schedulers.js';
runWhenIdle(() => {
  // Non-critical initialization
});
```

### Error Handling
```javascript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Graceful degradation
}
```

### State Management
```javascript
// Immutable state updates
const newState = { ...currentState, field: newValue };
// Debounced recalculation
debounce(() => recalculate(), 150);
```

### LocalStorage
```javascript
import { saveToStorage, loadFromStorage } from '../lib/storage.js';
saveToStorage('key', data);
const data = loadFromStorage('key', defaultValue);
```

## Troubleshooting

### App Not Loading
- Check browser console for ES6 module errors
- Verify `npm run serve` is running
- Check file paths (must use relative imports)

### Weather Not Updating
- Check network tab for API calls
- Verify API endpoints are accessible
- Check cache duration (1 hour for weather)

### Location Not Working
- Check browser geolocation permissions
- Verify geocoding API responses
- Check localStorage for saved location

### Tests Failing
- Run `npm test` to see specific failures
- Check calculator.js logic matches test expectations
- Verify time formatting functions

## Additional Resources

- **CLAUDE.md**: Comprehensive developer documentation
- **docs/trail-wetness.md**: Detailed wetness algorithm explanation
- **README.md**: User-facing project overview
- **package.json**: Dependencies and scripts

---

**Remember**: This is a solo-dev project optimized for fast iteration. Keep it simple, test manually, and use AI verification for code correctness.

