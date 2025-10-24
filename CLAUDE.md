# Wake Time Calculator - Claude Documentation

## Project Overview

Wake Time Calculator is a vanilla JavaScript web application that helps runners plan optimal wake times based on weather conditions. The application provides personalized wake time recommendations by analyzing weather forecasts, temperature preferences, and run durations.

## Architecture

### Project Structure
```
wake-time-calculator/
├── src/                      # Application source code
│   ├── index.html            # Main application HTML
│   ├── css/
│   │   └── main.css          # Application styles
│   └── js/
│       ├── app/              # Application modules (AI-first consolidated)
│       │   ├── awareness.js  # Weather awareness (805 lines)
│       │   ├── dawn.js       # Dawn time calculations (211 lines)
│       │   ├── location.js   # Location services (349 lines)
│       │   ├── main.js       # App orchestration (486 lines)
│       │   ├── ui.js         # UI utilities (44 lines)
│       │   └── weather.js    # Weather API and wetness (1117 lines - includes NJ calibration)
│       └── lib/              # Utility libraries
│           ├── constants.js  # Application constants (49 lines)
│           ├── time.js       # Time manipulation utilities (47 lines)
│           ├── schedulers.js # Scheduling utilities (61 lines)
│           ├── storage.js    # Local storage management (215 lines)
│           └── calculator.js # Core calculation logic (132 lines)
├── tests/                    # Test suite (minimal for solo dev)
│   └── unit/                 # Unit tests
│       └── lib/              # Library tests only
│           └── calculator.test.js  # Wake time calculations
└── docs/                     # Documentation

```

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Testing**: Node.js test runner (unit tests only - minimal for solo dev)
- **Code Quality**: Prettier (formatting only)
- **Development Server**: http-server (npm package)
- **Package Manager**: npm
- **Architecture**: AI-first consolidated modules (6 files vs 29 previously)

## Key Components

All components are now consolidated single-file modules for AI-first development.

### 1. Weather Module (`src/js/app/weather.js` - 1117 lines)
- **API Integration**: Open-Meteo forecast API with 1-hour caching
- **Wetness Algorithm**: 8-step moisture scoring (precipitation + snowmelt - evapotranspiration)
- **Trail Analysis**: Interprets wetness data into 7 condition states (Dry → Soaked)
- **Formatting**: Temperature, wind, precipitation display utilities
- **Key Features**: Intensity boost for heavy rain, seasonal ET₀ adjustment, time decay
- **NJ Coastal Calibration**: Tuned for Rumson, NJ climate (7:1 snow ratio, seasonal drying rates)
- **Quality**: Extracted helper functions, standardized error messages, clear constants

### 2. Awareness Module (`src/js/app/awareness.js` - 805 lines)
- **Weather Display**: Updates UI with dawn, wind chill, PoP, wet bulb, trail conditions
- **Status Icons**: 3-state system (OK ✅ / Yield ⚠ / Warning ⛔) for all factors
- **Location Management**: Geolocation, geocoding, city name resolution
- **Event System**: Tracks state changes for debugging (init, ready, error, etc.)
- **Initialization**: 3-tier fallback (localStorage → geolocation → manual)
- **Reliability**: Graceful degradation with Promise.allSettled, proper timeout cleanup

### 3. Location Module (`src/js/app/location.js` - 349 lines)
- **Geolocation**: Browser API wrapper with error handling (1-min cache)
- **Geocoding**: Forward search (place name → coords) via Open-Meteo
- **Reverse Geocoding**: Coords → place name with Open-Meteo + Nominatim fallback
- **Formatting**: US state abbreviations, duplicate removal, coordinate formatter utility
- **Architecture**: Flattened nesting, extracted helper functions for clarity

### 4. Dawn Module (`src/js/app/dawn.js` - 211 lines)
- **API Integration**: SunriseSunset.io for civil dawn times
- **Daylight Checks**: Determines if run starts before dawn (headlamp warning)
- **Caching**: In-memory cache with LRU eviction (50-entry limit)
- **Testing Utilities**: setTestDawn for development
- **Performance**: Probabilistic cache cleanup prevents memory leaks

### 5. Main App Module (`src/js/app/main.js` - 486 lines)
- **Orchestration**: WakeTimeApp class coordinates all modules
- **State Management**: Immutable state with debounced recalculation (150ms)
- **Lifecycle**: Element caching → load saved values → attach listeners → init awareness
- **Persistence**: Auto-save to localStorage on every change
- **Performance**: Lazy awareness init via runWhenIdle for fast first paint

### 6. UI Utilities (`src/js/app/ui.js` - 44 lines)
- **Debounce**: Rate-limiting for input handlers
- **Location Badges**: Daylight warning display logic

### 7. Calculator Library (`src/js/lib/calculator.js` - 132 lines)
- Pure wake time calculations (no side effects)
- Simple time subtraction: meeting time - (prep + run + travel + breakfast)
- Handles previous day rollover when wake time < midnight
- **Quality**: Comprehensive input validation with descriptive error messages

### 8. Support Libraries (`src/js/lib/`)
- **time.js** (47 lines): Time formatting, timezone conversions (removed redundant code)
- **storage.js** (215 lines): localStorage wrappers with JSON serialization, user-facing error alerts
- **constants.js** (49 lines): Default values, cache duration, timezone getter, MS_PER_HOUR constant
- **schedulers.js** (61 lines): runWhenIdle for deferred execution

## Development Workflow

### Prerequisites

This project requires:
- **Node.js** >= 20.19.0 (managed via `.nvmrc`)
- **npm** >= 10.0.0

If using nvm (recommended):
```bash
nvm use
```

### Setup Commands
```bash
# Install dependencies
npm install

# Start development server
npm run serve              # http-server on port 8000

# Run tests (unit tests only)
npm test                   # Runs calculator.test.js

# Code formatting
npm run format             # Auto-format with Prettier

# Build for production
npm run build              # Copies src/ to dist/
```



### Key Scripts
- `serve`: Starts http-server (npm package) on port 8000 serving from src/ directory
- `test`: Runs unit tests for calculator.js
- `format`: Formats code with Prettier
- `build`: Creates dist/ directory with production files

## Testing Strategy

### Test Coverage
The project uses **minimal testing** optimized for solo development:

- **Unit Tests**: Calculator logic only (7 tests)
  - `tests/unit/lib/calculator.test.js`: Wake time calculations
  - Tests core math functions: toMinutes, fromMinutes, format12, calculateWakeTime
  - All tests passing (100% coverage of calculator.js)

**Removed for Solo Dev:**
- ❌ Integration tests (manual testing preferred)
- ❌ Visual regression tests (Claude can verify UI visually)
- ❌ Performance tests (not needed for single user)
- ❌ Complex test infrastructure (Playwright, fixtures, mocks)

**Testing Philosophy:**
- Manual testing by user for features/UI
- Automated tests only for pure math (calculator)
- Claude verifies code correctness through reading/analysis
- Fast iteration > comprehensive automation

## Recent Major Changes

### NJ Coastal Climate Calibration (Oct 2024)
- **Regional Wetness Tuning**: Calibrated algorithm for Rumson, NJ coastal conditions
  - **Snow modeling**: 7:1 ratio for heavy maritime snow (vs 10:1 powder)
  - **Melt dynamics**: Snow melts at 32°F, full melt at 38°F (2-3 day persistence)
  - **Seasonal drying**: Summer 0.75/day, Winter 0.92/day, Spring/Fall 0.85/day
  - **Evapotranspiration**: Reduced coefficients for high coastal humidity
  - **Result**: More accurate trail condition predictions for NJ coastal climate

### Wetness Algorithm Fixes (Oct 2024)
- **7 Critical Improvements**: Fixed calculation bugs and improved robustness (#56)
  - **Timezone bug**: Fixed seasonal coefficient calculation for negative UTC offsets
  - **Snowmelt handling**: Added fallback when maxTempF missing from API
  - **Rain clarity**: Prevented double-counting snow in precipitation totals
  - **Magic numbers**: Extracted snowmelt curve constants for clarity
  - **Intensity heuristic**: Improved precipitation intensity estimation
  - **Performance**: Optimized seasonal coefficient calculation
  - **Debugging**: Added warnings for missing reference dates

### Code Quality Review (Oct 2024)
- **Comprehensive Quality Improvements**: Fixed 28 issues across all priority levels
  - **Critical (1)**: Fixed broken module import path that prevented app from loading
  - **High Priority (6)**: Bug fixes including error handling, validation, memory leaks, storage alerts
  - **Medium Priority (11)**: Code quality improvements including DRY violations, deep nesting, magic numbers
  - **Low Priority (10)**: Polish including error messages, animations, test code cleanup
  - **Result**: More reliable, maintainable, and consistent codebase
  - **Files Modified**: 12 total across 5 commits
  - **Changes**: ~50 lines removed, added comprehensive error handling and validation

### AI-First Consolidation (Oct 2024)
- **Phase 1: File Consolidation**: Merged 29 files → 6 modules for easier AI navigation
  - `weather/` (7 files) → `weather.js` (996 lines, +48 from quality improvements)
  - `location/` (4 files) → `location.js` (349 lines, +33 from improvements)
  - `awareness/` (7 files) → `awareness.js` (805 lines, +97 from improvements)
  - `dawn/` (3 files) → `dawn.js` (211 lines, +55 from cache management)
  - `main/` (6 files) → `main.js` (486 lines, +10 from cleanup)
  - `ui.js` simplified to 44 lines (-24 from dead code removal)
  - Benefits: All related code visible in single file, clear section markers
- **Phase 2: Enhanced Documentation**: Added step-by-step algorithm walkthroughs
  - Wetness calculation: 8 steps with examples and thresholds
  - Cross-module dependency maps
  - Lifecycle and initialization flow diagrams
  - "Why" comments for non-obvious decisions
- **Testing Reduction**: Removed 99% of tests (152 files → 1 file)
  - Kept only `calculator.test.js` (pure math functions)
  - Deleted: Playwright, visual regression, integration, performance tests
  - Rationale: Solo dev, manual testing, Claude verification

### Simplification Efforts (2024)
- **Aggressive Minimization** (Oct 2024): Removed all legacy config files and tooling
  - **Deleted**: docker/, .vscode/, .env.example, .editorconfig, .prettierignore, wake-time-calculator.code-workspace
  - **Removed**: 9 files totaling 403 lines of misleading/legacy configuration
  - **Result**: Repository now contains only essential files (source, tests, docs, package.json, .gitignore, .nvmrc)
  - **Active tools**: Prettier (formatting), http-server (dev server), GitHub Pages (deployment)
- **Partial Minimization** (Sept 2024): Reduced enterprise tooling for solo dev
  - Removed from active use: ESLint, html-validate, git hooks, complex CI/CD
  - Active tools: Prettier (formatting), http-server (dev server), GitHub Pages (deployment)
- **Documentation Harmonization** (Sept 2024): Fixed inaccuracies across 11 markdown files

### Removed Components (Migration from TypeScript)
- TypeScript compilation (migrated to vanilla JS)
- Complex build pipeline
- Service worker and offline functionality
- Firebase/Firestore integration
- User authentication system
- Social features and sharing
- Email notifications
- Complex state management
- React/Vue/Angular frameworks

### Simplified Architecture
- Direct ES6 module imports (no bundling)
- Vanilla JavaScript only
- Local storage for persistence
- http-server (npm package) for development
- No external runtime dependencies

## Best Practices

### Code Style
- Use ES6+ features (const/let, arrow functions, template literals)
- Follow existing patterns in the codebase
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use meaningful variable names

### Testing
- Write tests for new features
- Maintain existing test coverage
- Use appropriate test tags
- Test both success and error paths

### Performance
- Minimize API calls with caching
- Use local storage efficiently
- Optimize for mobile devices
- Keep bundle size minimal

### Security
- Never commit API keys
- Validate user inputs
- Use HTTPS for external APIs
- Follow CORS best practices

## Common Tasks

### Adding a New Feature
1. **Choose the right module**: Add to existing module (weather.js, awareness.js, etc.) or create new .js file
2. **Add section marker**: Use `// === SECTION NAME ===` for navigation
3. **Document inline**: Add JSDoc with examples, data flow, cross-references
4. **Import/Export**: Add to module exports, import in main.js or other consumers
5. **Update UI**: Add HTML in `index.html`, styles in `css/main.css`
6. **Manual test**: Load app, verify functionality works
7. **Add unit test**: Only if pure math/logic (like calculator.js)
8. **Update CLAUDE.md**: Add to Key Components section if significant

**AI-First Guidelines:**
- Keep related code together in one file (not scattered across subdirectories)
- Add step-by-step comments for complex algorithms
- Include concrete examples in JSDoc (input → output)
- Explain "why" for non-obvious decisions
- Use section markers instead of file boundaries

### Debugging
**Browser DevTools:**
- Use console for JavaScript errors
- Check Network tab for API calls
- Inspect Local Storage for saved data
- Review test outputs for failures

### Deployment
**GitHub Pages (Current):**
- Automatic deployment from `.github/workflows/pages.yml`
- No build step required - serves `src/` directory directly
- Live at: https://[username].github.io/wake-time-calculator/

**Static Hosting (Alternative):**
- Serve `src/` directory directly (no build needed)
- Any static host works (Netlify, Vercel, Cloudflare Pages)
- Ensure CORS headers for external API access

## API Integration

### Open-Meteo Weather API
- Free tier with no API key required
- Hourly forecast endpoint used
- Parameters: temperature, precipitation, wind speed, UV index
- Cached locally to reduce requests

### Geolocation
- Browser Geolocation API primary
- IP-based fallback available
- User permission required
- Graceful degradation if unavailable

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features required
- Local Storage API required
- Geolocation API preferred

## Performance Targets
- Initial load: < 2 seconds
- Time to Interactive: < 3 seconds
- API response handling: < 1 second
- Smooth animations at 60 FPS

## Maintenance Notes
- Update dependencies regularly
- Monitor API deprecations
- Test on multiple browsers
- Review and update documentation
- Keep test suite current