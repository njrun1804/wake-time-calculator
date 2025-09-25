# Quality Signals

This document outlines the quality checks and automation available in the wake-time-calculator repository.

## Available Commands

| Command | Tool | Purpose |
|---------|------|---------|
| `npm run lint` | Prettier | Code formatting consistency |
| `npm run test:unit` | Node.js test runner | Unit tests for calculator logic |
| `npm run test:e2e` | Playwright | End-to-end browser tests |
| `npm run test:modular` | Playwright | Modular architecture tests |
| `npm run test:performance` | Playwright | Performance budget checks |
| `npm run validate:html` | html-validate | HTML structure validation |
| `npm run validate:all` | Multiple | Combined formatting, HTML, and unit tests |

## CI Pipeline

The GitHub Actions CI workflow runs:

1. **Linting** - Prettier formatting checks
2. **Unit Tests** - Calculator logic and utilities
3. **Integration Tests** - Browser matrix (Chromium, Firefox, WebKit)
4. **Performance Tests** - Load time budget verification

## Test Coverage by Entry Point

- **wake.html** - Legacy smoke tests for backwards compatibility
- **index-modular.html** - Core calculator and UI integration tests
- **index-full-modular.html** - Complete stack including weather/dawn features

## Running Tests Locally

```bash
# Install dependencies and Playwright browsers
npm install
npx playwright install --with-deps

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:modular
npm run test:performance
```

## Pre-commit Checklist

Before submitting a PR, run:

```bash
npm run validate:all  # Quick validation
npm test             # Full test suite
```