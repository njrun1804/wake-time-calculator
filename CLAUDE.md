# Wake Time Calculator - Claude Documentation

## Project Overview

Wake Time Calculator is a vanilla JavaScript web application that helps runners plan optimal wake times based on weather conditions. The application provides personalized wake time recommendations by analyzing weather forecasts, temperature preferences, and run durations.

## Architecture

### Project Structure
```
wake-time-calculator/
├── index.html                # Main application HTML
├── css/
│   └── main.css              # Application styles
├── js/
│   ├── app/                  # Application modules
│   │   ├── main.js          # Entry point and initialization
│   │   ├── ui.js            # UI components and interactions
│   │   ├── weather.js       # Weather API integration
│   │   ├── awareness.js     # Weather awareness logic
│   │   ├── location.js      # Location services
│   │   └── dawn.js          # Dawn time calculations
│   └── lib/                  # Utility libraries
│       ├── constants.js     # Application constants
│       ├── time.js          # Time manipulation utilities
│       ├── schedulers.js    # Scheduling utilities
│       ├── storage.js       # Local storage management
│       └── calculator.js    # Core calculation logic
├── tests/                    # Test suite
│   ├── integration/         # Integration tests
│   ├── unit/                # Unit tests
│   ├── visual/              # Visual regression tests
│   │   └── screenshots/     # Screenshot baselines
│   ├── performance/         # Performance tests
│   └── helpers/             # Test utilities and mocks
├── scripts/                  # Build and utility scripts
└── docs/                    # Documentation

```

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Testing**: Playwright (integration + visual), Node.js test runner (unit)
- **Code Quality**: Prettier, ESLint, HTML Validator, Husky (pre-commit/pre-push)
- **Development Server**: Python HTTP server (local), Docker (containerized)
- **Package Manager**: npm
- **Containerization**: Docker and Docker Compose
- **Build Automation**: Makefile for common tasks

## Key Components

### 1. Weather Awareness (`js/app/awareness.js`)
- Analyzes weather conditions for optimal run timing
- Considers temperature, precipitation, wind speed, and UV index
- Provides color-coded recommendations (green/yellow/red)

### 2. Location Services (`js/app/location.js`)
- Manages user location with fallback options
- Supports browser geolocation API
- Provides fallback to IP-based location
- Stores location preferences locally

### 3. Weather Integration (`js/app/weather.js`)
- Integrates with Open-Meteo API for weather data
- Fetches hourly forecasts
- Caches weather data to reduce API calls
- Handles API errors gracefully

### 4. Dawn Calculations (`js/app/dawn.js`)
- Calculates sunrise and sunset times
- Determines civil/nautical/astronomical twilight
- Uses astronomy formulas for accurate calculations

### 5. Time Utilities (`js/lib/time.js`)
- Formats times for display
- Handles timezone conversions
- Provides relative time calculations

### 6. Core Calculator (`js/lib/calculator.js`)
- Implements sleep cycle calculations (90-minute cycles)
- Determines optimal wake times
- Considers preparation time and run duration

## Development Workflow

### Setup Commands
```bash
# Install dependencies
npm install

# Start development server
npm run serve              # Python server on port 8000
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
```bash
# Development with Docker
docker-compose up dev      # Dev server in container (port 8000)
make docker-dev            # Same via Makefile

# Testing with Docker
docker-compose up playwright        # Run all Playwright tests
docker-compose up playwright-visual # Run visual regression tests only

# Production build
docker build -t wake-time-calculator .
docker run -p 8080:80 wake-time-calculator
# Or use Makefile
make docker-build          # Build production image
make docker-run            # Build and run production container (port 8080)

# Cleanup
docker-compose down
make docker-stop           # Stop all containers
make clean                 # Remove all temporary files
```

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
- `serve`: Starts Python HTTP server on port 8000
- `test:ci`: Runs CI test suite with specific tags
- `prepare`: Installs Husky hooks
- Makefile targets available via `make help`

## Testing Strategy

### Test Coverage
- **Unit Tests**: Core calculations, utilities, and data transformations
- **Integration Core Tests** (`@core`): Essential user flows
- **Integration Full Tests** (`@full`): Complete feature coverage including weather awareness
- **Visual Regression Tests** (`@visual`): UI appearance, responsive design, accessibility
- **Performance Tests**: Load times, API response handling
- **Regression Tests** (`@regression`): Previously fixed bugs

### Visual Testing
The project includes comprehensive visual regression testing:
- **Responsive Design Tests**: Multiple viewport sizes (mobile, tablet, desktop, wide)
- **Weather State Tests**: Color-coded UI states (OK/green, Caution/yellow, Avoid/red)
- **Accessibility Tests**: Focus states, keyboard navigation, WCAG compliance, touch targets
- **Cross-Browser Testing**: Chromium, Firefox, and WebKit in CI

**Visual Test Files:**
- `tests/visual/responsive.spec.js`: Viewport and layout testing
- `tests/visual/weather-states.spec.js`: Weather awareness UI states
- `tests/visual/accessibility.spec.js`: Focus rings, contrast, screen reader support

**Interactive Visual Testing with Puppeteer MCP:**
For development and debugging, Puppeteer MCP can be used interactively via Claude Code CLI:
- Capture screenshots at any viewport size
- Test form interactions visually
- Generate documentation screenshots
- Debug UI issues in real-time
- No code changes required - works directly through Claude Code

### Test Organization
Tests are tagged for selective execution:
- `@core`: Essential functionality
- `@full`: Complete feature set
- `@visual`: Visual regression tests
- `@a11y`: Accessibility tests
- `@performance`: Performance metrics
- `@regression`: Bug fix validation

## Configuration Files

### `.prettierrc`
Code formatting configuration for consistent style

### `.htmlvalidate.json`
HTML validation rules ensuring accessibility and standards compliance

### `playwright.config.js`
Integration test configuration with browser settings and test patterns. Configured for multi-browser testing:
- **WebKit** (Safari): Default for local development
- **Chromium** (Chrome/Edge): Used in CI visual tests
- **Firefox**: Used in CI visual tests

### `.env.example`
Environment variables template (if using API keys)

### `.vscode/`
VS Code workspace configuration:
- `settings.json`: Editor settings optimized for Claude Code CLI
- `tasks.json`: Quick access to dev server, tests, validation
- `launch.json`: Debug configurations for tests and Chrome
- `extensions.json`: Recommended extensions

### `Makefile`
Build automation with common development tasks. Run `make help` to see all targets.

### `Dockerfile` & `docker-compose.yml`
Container configuration for development and production environments

### `.dockerignore`
Excludes unnecessary files from Docker builds

## Recent Major Changes

### Added (2024-2025)
- **Visual Regression Testing Suite** (Sept 2024): Comprehensive UI testing across multiple viewports and browsers
- **ESLint Configuration** (Sept 2024): Modern flat config for JavaScript linting
- **Multi-Browser CI Pipeline** (Sept 2024): Chromium, Firefox, and WebKit testing
- **Docker Containerization** (Sept 2024): Development and production containers with healthchecks
- **VS Code Integration** (Sept 2024): Enhanced debugging, tasks, and extension recommendations

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
- Simple Python HTTP server for development
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
1. Create feature module in `js/app/`
2. Import and initialize in `main.js`
3. Add UI components to `index.html`
4. Style with CSS in `css/main.css`
5. Write unit tests in `tests/unit/`
6. Add integration tests in `tests/integration/`
7. Add visual tests in `tests/visual/` if UI changes are significant
8. Update visual baselines with `npm run test:visual:update`

### Debugging
**Browser DevTools:**
- Use console for JavaScript errors
- Check Network tab for API calls
- Inspect Local Storage for saved data
- Review test outputs for failures

**VS Code Debugging:**
- Set breakpoints in test files
- Use F5 to start "Server + Chrome" debug configuration
- Debug Playwright tests with built-in debugger
- Debug unit tests with Node.js debugger

**Docker Debugging:**
- Check container logs: `docker-compose logs dev`
- Shell into container: `docker exec -it wake-time-calculator-dev sh`
- Verify container status: `docker ps`

### Deployment
**Static Hosting:**
- No build step required
- Serve static files directly
- Configure web server for SPA routing if needed
- Ensure CORS headers for API access

**Docker Deployment:**
```bash
# Production deployment
docker build -t wake-time-calculator:latest .
docker run -d -p 80:80 wake-time-calculator:latest

# Or with docker-compose
docker-compose up -d app
```

**Files:**
- `Dockerfile`: Nginx-based production image (~10MB)
- `docker-compose.yml`: Multi-environment container configs
- `.dockerignore`: Optimized image builds

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