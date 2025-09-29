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
│   └── performance/         # Performance tests
├── scripts/                  # Build and utility scripts
└── docs/                    # Documentation

```

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Testing**: Playwright for integration tests, Node.js test runner for unit tests
- **Code Quality**: Prettier, HTML Validator, Husky for pre-commit hooks
- **Development Server**: Python HTTP server
- **Package Manager**: npm

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
npm run serve

# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:core          # Core integration tests
npm run test:awareness     # Full integration tests with awareness features
npm run test:performance   # Performance tests

# Code quality checks
npm run lint               # Check formatting
npm run format             # Auto-format code
npm run validate:html      # Validate HTML
npm run validate:all       # Run all validations
```

### Key Scripts
- `serve`: Starts Python HTTP server on port 8000
- `test:ci`: Runs CI test suite with specific tags
- `prepare`: Installs Husky hooks

## Testing Strategy

### Test Coverage
- **Unit Tests**: Core calculations, utilities, and data transformations
- **Integration Core Tests** (`@core`): Essential user flows
- **Integration Full Tests** (`@full`): Complete feature coverage including weather awareness
- **Performance Tests**: Load times, API response handling
- **Regression Tests** (`@regression`): Previously fixed bugs

### Test Organization
Tests are tagged for selective execution:
- `@core`: Essential functionality
- `@full`: Complete feature set
- `@performance`: Performance metrics
- `@regression`: Bug fix validation

## Configuration Files

### `.prettierrc`
Code formatting configuration for consistent style

### `.htmlvalidate.json`
HTML validation rules ensuring accessibility and standards compliance

### `playwright.config.js`
Integration test configuration with browser settings and test patterns

### `.env.example`
Environment variables template (if using API keys)

## Recent Major Changes

### Removed Components
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

### Debugging
- Use browser DevTools console
- Check Network tab for API calls
- Inspect Local Storage for saved data
- Review test outputs for failures

### Deployment
- No build step required
- Serve static files directly
- Configure web server for SPA routing if needed
- Ensure CORS headers for API access

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