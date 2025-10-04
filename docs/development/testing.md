# Test Coverage Documentation

This document maps the application components to their test coverage and defines the testing strategy for maintaining quality.

## Application Test Coverage

### Entry Module: `src/js/app/main/index.js`
Bootstraps the single-page calculator experience and wires together UI composition, state management, and persistence.

**Module Dependencies:**
- `src/index.html` - Hosts the SPA shell
- `src/js/app/ui.js` - UI components and interactions
- `src/js/app/awareness/` - Weather awareness coordination modules
- `src/js/app/weather/` - Weather API and analysis modules
- `src/js/app/dawn/` - Dawn time calculation modules
- `src/js/app/location/` - Geolocation service modules
- `src/js/app/main/` - Main app orchestration modules
- `src/js/lib/calculator.js` - Core calculation logic
- `src/js/lib/storage.js` - Data persistence
- `src/js/lib/time.js` - Time utilities
- `src/js/lib/constants.js` - Configuration
- `src/js/lib/schedulers.js` - Deferred execution

## Test Suite Organization

### Unit Tests (`tests/unit/`)
**Purpose:** Test pure functions and business logic in isolation

**Current Coverage:**
- Calculator logic (wake time calculations, cycle planning)
- Storage operations (local persistence helpers)

**Planned Additions:**
- Time utilities and formatting
- Dawn time computations
- Weather data normalization

**Test Files:**
- `lib/calculator.test.js` - Core calculation and planner behaviour
- `lib/storage.test.js` - LocalStorage interactions and fallbacks

### Integration Tests (`tests/integration/`)
**Purpose:** Test complete user workflows and feature interactions

**Core Tests** (`@core` tag):
- Basic calculator functionality
- Form input and validation
- Time display updates
- Storage persistence
- Previous day handling

**Awareness Tests** (`@full` tag):
- Weather data fetching and display
- Location detection and fallback
- Dawn time integration
- Trail wetness scoring
- Daylight warnings
- API error handling

**Regression Tests** (`@regression` tag):
- Previously fixed bugs
- Edge cases discovered in production
- Browser-specific issues

### Performance Tests (`tests/performance/`)
**Purpose:** Monitor and enforce performance budgets

**Metrics:**
- Page load time (< 2 seconds)
- Time to Interactive (< 3 seconds)
- API response handling (< 1 second)
- Memory usage patterns
- Bundle size monitoring

## Test Execution Matrix

| Test Type | Command | When to Run | CI/CD |
|-----------|---------|-------------|-------|
| Unit | `npm run test:unit` | Every code change | Pre-push hook |
| Core Integration | `npm run test:core` | Feature changes | PR validation |
| Full Integration | `npm run test:awareness` | Weather/API changes | PR validation |
| Performance | `npm run test:performance` | Before release | Nightly builds |
| All Tests | `npm test` | Before merge | Required |

## Coverage Requirements

### Critical Paths (100% Coverage Required)
1. Wake time calculation pipeline (validated by `npm run test:unit`)
2. Data persistence helpers and fallbacks (validated by `npm run test:unit`)

### High Priority (>90% Coverage)
1. Time utilities and formatting helpers (planned unit suite)
2. Dawn time computations (planned unit suite)
3. Storage rehydration flows across tabs

### Medium Priority (>80% Coverage)
1. Weather enrichment pipeline (future unit + integration coverage)
2. Location detection fallbacks
3. UI orchestration and state transitions

## Test Data Management

### Fixtures
- Mock weather API responses
- Sample location data
- Time zone test cases
- Edge case scenarios

### Test Environment
- LocalStorage isolation per test
- API mocking capabilities
- Deterministic time handling
- Browser context management

## Continuous Integration

### Pre-commit Hooks
- Prettier formatting
- Lint-staged checks

### Pre-push Hooks
- Format verification
- Unit test execution

### Pull Request Checks
- Full test suite
- Performance benchmarks
- HTML validation
- Code coverage report

### Deployment Gate
- All tests passing
- Performance budgets met
- No console errors
- Accessibility checks

## Adding New Tests

### For New Features
1. Write unit tests for logic
2. Add integration test for user flow
3. Include performance impact check
4. Update this documentation

### For Bug Fixes
1. Add regression test first (should fail)
2. Fix the bug
3. Verify test passes
4. Tag with `@regression`

## Test Maintenance

### Weekly
- Review flaky tests
- Update test data
- Check coverage metrics

### Monthly
- Performance baseline update
- Cross-browser testing
- Dependency updates

### Quarterly
- Coverage gap analysis
- Test suite optimization
- Documentation review

## Known Testing Gaps

Current areas needing additional coverage:
- Mobile device testing
- Offline functionality
- Accessibility testing
- Internationalization
- Performance under poor network conditions

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Testing Best Practices](https://testingjavascript.com/)
- [Web Performance Testing](https://web.dev/vitals/)
