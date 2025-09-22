# MoodEats Testing Guide

## 🧪 Professional Testing Stack

We now use industry-standard testing tools that would have caught the "fresh button bug":

### Testing Frameworks

#### 1. **Jest** - Unit Testing
- Fast, reliable JavaScript testing
- Built-in coverage reports
- Snapshot testing support
- Mocking capabilities

#### 2. **Playwright** - E2E Testing
- Real browser testing (Chrome, Firefox, Safari)
- Mobile device simulation
- Network interception
- Visual regression testing
- Automatic waiting for elements

## Installation

```bash
npm install
```

This installs:
- `@playwright/test` - Cross-browser E2E testing
- `jest` - Unit testing framework
- `jest-environment-jsdom` - DOM testing in Node.js
- `eslint` - Code quality checks

## Running Tests

### Quick Start
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Watch mode (reruns on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive Playwright UI
npm run test:ui

# See tests run in browser
npm run test:headed
```

### Legacy Tests (still useful!)
```bash
# Run original test suite
npm run validate

# Or use the bash script
./run-all-tests.sh
```

## What These Tests Catch

### The "Fresh Button Bug" Would Be Caught By:

#### Playwright Test (Line 18-34 in planner.spec.js):
```javascript
test('all mood buttons work and show meals', async ({ page }) => {
  for (const mood of moods) {
    await page.click(`[data-mood="${mood}"]`);
    await expect(page.locator('#suggestionsArea')).toBeVisible();
    const mealCards = page.locator('#mealSuggestions .card');
    const count = await mealCards.count();
    expect(count).toBeGreaterThan(0); // ← Would FAIL if no meals shown!
  }
});
```

#### Jest Test (Line 89 in meals.test.js):
```javascript
test('should call setupBrowseViewEventListeners after loadMeals', () => {
  expect(loadMealsMatch[0]).toContain('setupBrowseViewEventListeners()');
  // ← Would FAIL if event listeners attached before meals loaded!
});
```

## Test Coverage

### Unit Tests (Jest)
- ✅ Data validation (76 meals, correct structure)
- ✅ Search functionality (toast, chicken, eggs)
- ✅ Category validation
- ✅ HTML structure checks
- ✅ Function existence and order
- ✅ LocalStorage key conventions

### E2E Tests (Playwright)
- ✅ All 8 mood buttons actually work
- ✅ Search input functionality
- ✅ Tab switching
- ✅ Modal opening/closing
- ✅ Breakfast-only filtering
- ✅ Rapid clicking resilience
- ✅ XSS/injection protection
- ✅ LocalStorage persistence
- ✅ Mobile responsiveness

## CI/CD Pipeline

GitHub Actions runs 3 parallel jobs on every push:

1. **Unit Tests** - Jest tests with coverage
2. **E2E Tests** - Playwright on 3 browsers
3. **Legacy Tests** - Original validation suite

## Benefits Over Manual Testing

### Before (Manual Tests):
```javascript
// Could only check if data existed
assert(meals.length === 76)
```

### Now (Automated Browser Tests):
```javascript
// Actually clicks button and verifies UI updates
await page.click('[data-mood="fresh"]');
await expect(mealCards.count()).toBeGreaterThan(0);
```

## Common Testing Patterns

### Testing Async Loading
```javascript
// Wait for meals to load
await page.waitForFunction(() => window.meals && window.meals.length > 0);
```

### Testing UI State Changes
```javascript
await page.click('#planTab');
await expect(page.locator('#planView')).toBeVisible();
await expect(page.locator('#browseView')).toBeHidden();
```

### Testing Edge Cases
```javascript
const specialStrings = ['<script>', '"; DROP TABLE;', '🍕🍔'];
for (const str of specialStrings) {
  await searchInput.fill(str);
  // Verify app doesn't break
}
```

## Debugging Failed Tests

### See what Playwright sees
```bash
# Run with headed browser
npm run test:headed

# Use debug mode
npx playwright test --debug
```

### Check coverage gaps
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

### View test recordings
After test failures, check:
- `test-results/` - Screenshots of failures
- `playwright-report/` - Full HTML report

## Writing New Tests

### Add a Unit Test
Create file in `tests/unit/` ending with `.test.js`:
```javascript
describe('New Feature', () => {
  test('should work correctly', () => {
    expect(myFunction()).toBe(expectedValue);
  });
});
```

### Add an E2E Test
Create file in `tests/e2e/` ending with `.spec.js`:
```javascript
test('user can do something', async ({ page }) => {
  await page.goto('/moodeats.html');
  await page.click('#myButton');
  await expect(page.locator('#result')).toBeVisible();
});
```

## Test Philosophy

> "If it can break, test it. If users click it, test it. If it loads async, test it twice."

The fresh button bug taught us: **Test the actual user experience, not just the data.**

## Next Steps

Consider adding:
- Visual regression testing with Playwright
- API mocking for offline tests
- Performance testing with Lighthouse
- Accessibility testing with axe-core
- Mutation testing to verify test quality

Remember: Good tests catch bugs before users do! 🐛🔨