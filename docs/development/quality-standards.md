# Quality Signals

This document outlines the quality checks and automation available in the wake-time-calculator repository.

## Available Commands

| Command | Tool | Purpose |
|---------|------|---------|
| `npm run lint` | Prettier | Code formatting consistency |
| `npm run test:unit` | Node.js test runner | Unit tests for calculator logic |
| `npm run test:core` | Playwright | Core planner regression (WebKit, Chromium, Firefox) |
| `npm run test:awareness` | Playwright | Weather-aware regression (WebKit, Chromium, Firefox) |
| `npm run test:performance` | Playwright | Performance budget checks (WebKit, Chromium, Firefox) |
| `npm run test:visual` | Playwright | Visual regression tests (WebKit, Chromium, Firefox) |
| `npm run validate:html` | html-validate | HTML structure validation |
| `npm run validate:all` | Multiple | Combined formatting, HTML, and unit tests |

## CI Pipeline

The GitHub Actions CI workflow runs:

1. **Linting** - Prettier formatting checks (Ubuntu runners)
2. **Unit Tests** - Calculator logic and utilities (Ubuntu runners)
3. **Integration Tests** - Multi-browser testing via WebKit, Chromium, and Firefox
4. **Performance Tests** - Performance budget verification across all browsers
5. **Visual Regression Tests** - Screenshot comparison across all browsers (Linux baselines)

## Test Coverage by Entry Point

- **index.html** - Single entry covered by core and awareness integration suites plus the performance probe.

## Running Tests Locally

```bash
# Install dependencies and Playwright browsers
npm install
npx playwright install --with-deps

# Run all tests (all 3 browsers)
npm test

# Run specific test suites
npm run test:unit           # Unit tests only (no browser)
npm run test:core           # Core integration tests (all browsers)
npm run test:awareness      # Full integration tests (all browsers)
npm run test:performance    # Performance tests (all browsers)
npm run test:visual         # Visual regression tests (all browsers)

# Run tests for specific browser
npm test -- --project=webkit
npm test -- --project=chromium
npm test -- --project=firefox
```

## Pre-commit Checklist

Before submitting a PR, run:

```bash
npm run validate:all  # Quick validation
npm test             # Full test suite
```
