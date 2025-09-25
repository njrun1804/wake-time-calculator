# Quality Signals

This document outlines the quality checks and automation available in the wake-time-calculator repository.

## Available Commands

| Command | Tool | Purpose |
|---------|------|---------|
| `npm run lint` | Prettier | Code formatting consistency |
| `npm run test:unit` | Node.js test runner | Unit tests for calculator logic |
| `npm run test:e2e` | Playwright | Safari-only end-to-end regression |
| `npm run test:modular` | Playwright | Core modular calculator checks (Safari) |
| `npm run test:full-modular` | Playwright | Weather-aware modular regression (Safari) |
| `npm run test:performance` | Playwright | Performance budget checks (Safari) |
| `npm run validate:html` | html-validate | HTML structure validation |
| `npm run validate:all` | Multiple | Combined formatting, HTML, and unit tests |

## CI Pipeline

The GitHub Actions CI workflow runs:

1. **Linting** - Prettier formatting checks (Ubuntu runners)
2. **Unit Tests** - Calculator logic and utilities (Ubuntu runners)
3. **Integration Tests** - Safari desktop via WebKit on macOS runners
4. **Performance Tests** - Safari performance budget verification on macOS runners

## Test Coverage by Entry Point

- **index-full-modular.html** - Default entry covered by full-modular integration suite and performance probe.
- **index-modular.html** - Core calculator flow exercised by the modular integration suite.

## Running Tests Locally

```bash
# Install dependencies and Playwright WebKit
npm install
npx playwright install webkit --with-deps

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:modular
npm run test:full-modular
npm run test:performance
```

## Pre-commit Checklist

Before submitting a PR, run:

```bash
npm run validate:all  # Quick validation
npm test             # Full test suite
```
