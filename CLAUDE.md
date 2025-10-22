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
│       │   ├── awareness.js  # Weather awareness (708 lines)
│       │   ├── dawn.js       # Dawn time calculations (156 lines)
│       │   ├── location.js   # Location services (316 lines)
│       │   ├── main.js       # App orchestration (476 lines)
│       │   ├── ui.js         # UI utilities (68 lines)
│       │   └── weather.js    # Weather API and wetness (948 lines)
│       └── lib/              # Utility libraries
│           ├── constants.js  # Application constants
│           ├── time.js       # Time manipulation utilities
│           ├── schedulers.js # Scheduling utilities
│           ├── storage.js    # Local storage management
│           └── calculator.js # Core calculation logic
├── tests/                    # Test suite (minimal for solo dev)
│   └── unit/                 # Unit tests
│       └── lib/              # Library tests only
│           └── calculator.test.js  # Wake time calculations
├── scripts/                  # Build and utility scripts
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

### 1. Weather Module (`src/js/app/weather.js` - 948 lines)
- **API Integration**: Open-Meteo forecast API with 1-hour caching
- **Wetness Algorithm**: 8-step moisture scoring (precipitation + snowmelt - evapotranspiration)
- **Trail Analysis**: Interprets wetness data into 7 condition states (Dry → Soaked)
- **Formatting**: Temperature, wind, precipitation display utilities
- **Key Features**: Intensity boost for heavy rain, seasonal ET₀ adjustment, time decay

### 2. Awareness Module (`src/js/app/awareness.js` - 708 lines)
- **Weather Display**: Updates UI with dawn, wind chill, PoP, wet bulb, trail conditions
- **Status Icons**: 3-state system (OK ✅ / Yield ⚠ / Warning ⛔) for all factors
- **Location Management**: Geolocation, geocoding, city name resolution
- **Event System**: Tracks state changes for debugging (init, ready, error, etc.)
- **Initialization**: 3-tier fallback (localStorage → geolocation → manual)

### 3. Location Module (`src/js/app/location.js` - 316 lines)
- **Geolocation**: Browser API wrapper with error handling
- **Geocoding**: Forward search (place name → coords) via Open-Meteo
- **Reverse Geocoding**: Coords → place name with Open-Meteo + Nominatim fallback
- **Formatting**: US state abbreviations, duplicate removal, smart city labels

### 4. Dawn Module (`src/js/app/dawn.js` - 156 lines)
- **API Integration**: SunriseSunset.io for civil dawn times
- **Daylight Checks**: Determines if run starts before dawn (headlamp warning)
- **Caching**: In-memory cache to reduce API calls
- **Testing Utilities**: setTestDawn for development

### 5. Main App Module (`src/js/app/main.js` - 476 lines)
- **Orchestration**: WakeTimeApp class coordinates all modules
- **State Management**: Immutable state with debounced recalculation (150ms)
- **Lifecycle**: Element caching → load saved values → attach listeners → init awareness
- **Persistence**: Auto-save to localStorage on every change
- **Performance**: Lazy awareness init via runWhenIdle for fast first paint

### 6. UI Utilities (`src/js/app/ui.js` - 68 lines)
- **Debounce**: Rate-limiting for input handlers
- **Location Badges**: Daylight warning display logic
- **Dirt Detection**: Identifies trail locations requiring wetness checks

### 7. Calculator Library (`src/js/lib/calculator.js`)
- Pure wake time calculations (no side effects)
- Simple time subtraction: meeting time - (prep + run + travel + breakfast)
- Handles previous day rollover when wake time < midnight

### 8. Support Libraries (`src/js/lib/`)
- **time.js**: Time formatting, timezone conversions
- **storage.js**: localStorage wrappers with JSON serialization
- **constants.js**: Default values, cache duration, timezone
- **schedulers.js**: runWhenIdle for deferred execution

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
make serve                 # Same via Makefile

# Run all tests
npm test
make test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:core          # Core integration tests
npm run test:awareness     # Full integration tests with awareness features
npm run test:performance   # Performance tests
npm run test:visual        # Visual regression tests
npm run test:visual:update # Update visual test baselines
make test-unit             # Unit tests via Makefile
make test-core             # Core tests via Makefile

# Code quality checks
npm run lint               # Check formatting
npm run format             # Auto-format code
npm run validate:html      # Validate HTML
npm run validate:all       # Run all validations
make format                # Format via Makefile
make validate              # Validate via Makefile
```

### Docker Commands

**Production Container:**
```bash
# Build and run production image (Nginx-based)
make docker-run            # Builds image and runs on port 8080
# Or manually:
docker build -t wake-time-calculator:latest .
docker run -d -p 8080:80 --name wake-time-calculator wake-time-calculator:latest

# Using docker-compose
docker-compose up app      # Port 8080

# Cleanup
make docker-stop           # Stops and removes containers
docker-compose down
```

**Development Container:**
```bash
# Live-reload dev server (Python-based, mounts src/)
make docker-dev            # Port 8000
docker-compose up dev      # Same

# Local edits appear instantly (volume mounted)
```

**Testing Containers:**
```bash
docker-compose up playwright        # All Playwright tests
docker-compose up playwright-visual # Visual regression only
```

**Container Details:**
- Production: Nginx serving static files from `/usr/share/nginx/html`
- Development: Python 3.11-alpine serving from `/app/src` (live reload)
- Health checks: `wget --spider` on ports 80/8000
- Logs: `docker-compose logs -f <service>`


### VS Code Integration
The project includes VS Code configuration for enhanced development:

**Tasks** (⌘+Shift+B):
- Start Dev Server
- Run All Tests
- Run Unit Tests
- Run Core Tests
- Format Code
- Validate All

**Debug Configurations** (F5):
- Debug Playwright Tests
- Debug Current Playwright Test
- Debug Unit Tests
- Launch Chrome (with debugger)
- Server + Chrome (compound - starts server then debugger)

**Extensions**:
- Prettier (auto-formatting)
- ESLint (JavaScript linting)
- Playwright (test runner integration)
- HTML Validate (real-time validation)
- Docker (container management)
- Git Graph (visual git history)
- Path Intellisense (file path autocomplete)
- Error Lens (inline error display)

### Key Scripts
- `serve`: Starts http-server (npm package) on port 8000 serving from src/ directory
- `test:ci`: Runs CI test suite with specific tags
- `prepare`: Installs Husky hooks
- Makefile targets available via `make help`

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

## Configuration Files

### `.prettierrc`
Code formatting configuration (only remaining quality tool)

### `.vscode/`
VS Code workspace configuration:
- `settings.json`: Editor settings optimized for Claude Code CLI
- `tasks.json`: Quick access to dev server and formatting
- `extensions.json`: Recommended extensions (Prettier only)

## Recent Major Changes

### AI-First Consolidation (Oct 2024)
- **Phase 1: File Consolidation**: Merged 29 files → 6 modules for easier AI navigation
  - `weather/` (7 files) → `weather.js` (948 lines)
  - `location/` (4 files) → `location.js` (316 lines)
  - `awareness/` (7 files) → `awareness.js` (708 lines)
  - `dawn/` (3 files) → `dawn.js` (156 lines)
  - `main/` (6 files) → `main.js` (476 lines)
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

### Added (2024)
- **Extreme Minimization** (Sept 2024): Removed enterprise tooling for solo dev
  - Deleted: Docker, Makefile, ESLint, html-validate, git hooks, CI/CD
  - Kept: Prettier (formatting), http-server (dev server), GitHub Pages (deployment)
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

**VS Code Debugging:**
- Use F5 to start "Server + Chrome" debug configuration
- Set breakpoints in source files
- Debug unit tests with Node.js debugger

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