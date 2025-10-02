# Visual Regression Tests

This directory contains visual regression tests for the Wake Time Calculator app. These tests capture screenshots of the UI at various states and compare them against baseline images to detect unintended visual changes.

## Test Files

- **`responsive.spec.js`**: Tests responsive design across multiple viewport sizes (mobile, tablet, desktop, wide)
- **`weather-states.spec.js`**: Tests weather awareness UI states and color coding (OK/green, Caution/yellow, Avoid/red)
- **`accessibility.spec.js`**: Tests accessibility features including focus states, keyboard navigation, and WCAG compliance

## Running Visual Tests

```bash
# Run all visual tests
npm run test:visual

# Run visual tests for specific browser
npm run test:visual -- --project=chromium
npm run test:visual -- --project=firefox
npm run test:visual -- --project=webkit

# Update baseline screenshots (after intentional UI changes)
npm run test:visual:update

# Run in Docker
docker-compose up playwright-visual
```

## Screenshot Organization

```
tests/visual/
├── *-snapshots/           # Screenshot baseline directories
│   ├── *-chromium-linux.png   # Chromium on Linux (CI)
│   ├── *-firefox-linux.png    # Firefox on Linux (CI)
│   ├── *-webkit-linux.png     # WebKit on Linux (CI)
│   └── *-darwin.png           # macOS baselines (gitignored)
└── test-results/          # Test run outputs (gitignored)
```

### Baseline Screenshots
- Committed to version control (Linux versions only)
- Platform-specific: `*-linux.png` for CI, `*-darwin.png` for local macOS (gitignored)
- Used as the reference for visual regression tests
- Should only be updated when UI changes are intentional
- Updated with `npm run test:visual:update` or Docker

### Test Results
- Generated during test runs in `test-results/`
- Compared against baselines
- Ignored by git (see `.gitignore`)
- Useful for debugging test failures

## How Visual Tests Work

1. Playwright navigates to the app and performs interactions
2. Screenshots are captured at key states
3. Screenshots are compared pixel-by-pixel with baselines
4. Tests fail if differences exceed threshold
5. Diff images are generated showing changes

## Updating Baselines

Only update baselines when UI changes are **intentional**:

```bash
# Review current UI state in browser first
npm run serve

# Update baselines for all tests (macOS - local only)
npm run test:visual:update

# Update baselines for specific test
npm run test:visual:update -- responsive.spec.js

# Generate Linux baselines for CI (using Docker)
docker compose run --rm playwright npx playwright test tests/visual --update-snapshots

# Commit updated baselines (Linux only)
git add tests/visual/*-snapshots/*-linux.png
git commit -m "Update visual test baselines for [feature]"
```

## CI/CD Integration

Visual tests run automatically in GitHub Actions on:
- Every push to `main`
- Every pull request

The CI pipeline:
1. Runs visual tests across 3 browsers (Chromium, Firefox, WebKit)
2. Uploads test results as artifacts
3. Uploads screenshots for debugging
4. Fails PR if visual regressions detected

## Interactive Visual Testing with Puppeteer MCP

For development and debugging, use Puppeteer MCP through Claude Code CLI:

```bash
# Start Claude Code CLI
claude

# Ask Claude to:
# - Take screenshots at any viewport size
# - Test form interactions visually
# - Generate documentation screenshots
# - Debug UI issues in real-time
```

**Benefits:**
- No code changes required
- Works directly through conversation
- Instant visual feedback
- Great for exploring UI states

## Best Practices

1. **Keep tests focused**: Each test should verify one specific visual aspect
2. **Use descriptive names**: Screenshot names should indicate what they're testing
3. **Minimize flakiness**: Disable animations, use fixed viewport sizes
4. **Review failures carefully**: Not all visual differences are regressions
5. **Update selectively**: Only update baselines you've reviewed
6. **Test responsively**: Include mobile, tablet, and desktop viewports
7. **Test states**: Capture initial state, loading, success, and error states

## Common Issues

### Tests failing with pixel differences
- Check if animations are disabled
- Verify fonts are loading consistently
- Look for dynamic content (dates, times, random data)
- Consider increasing `maxDiffPixels` threshold if needed

### Screenshots look different locally vs CI
- CI runs on Linux (Ubuntu), local may be macOS/Windows
- Platform rendering differences (fonts, anti-aliasing)
- Solution: Generate Linux baselines using Docker
- Use `docker compose run --rm playwright` for CI-matching results
- macOS baselines (`*-darwin.png`) are gitignored automatically

### Baselines out of sync
- Pull latest changes: `git pull`
- Regenerate baselines: `npm run test:visual:update`
- Verify changes before committing

## Debugging Failed Tests

1. Check test output for failure details
2. Review uploaded screenshots in CI artifacts
3. Run tests locally: `npm run test:visual`
4. Compare current vs baseline images
5. Use Puppeteer MCP for interactive debugging
6. Fix issue or update baseline if intentional

## Tags

Visual tests use these tags:
- `@visual`: All visual regression tests
- `@a11y`: Accessibility-focused tests

Run tagged tests:
```bash
playwright test --grep @visual
playwright test --grep @a11y
```