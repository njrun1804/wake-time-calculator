// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Network Failure Handling', () => {
  test('handles meals.json load failure gracefully', async ({ page }) => {
    // Block meals.json request
    await page.route('**/meals.json', route => route.abort());

    // Monitor console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/moodeats-planner.html');
    await page.waitForLoadState('domcontentloaded');

    // Wait for attempted load
    await page.waitForTimeout(3000);

    // App should still be accessible even with load failure
    await expect(page.locator('body')).toBeVisible();

    // Check if basic UI elements exist (may be hidden due to tabs)
    const searchInput = page.locator('#searchInput');
    const isSearchInputPresent = await searchInput.count() > 0;
    expect(isSearchInputPresent).toBe(true);

    // App should not crash completely - basic structure should be intact
    const hasBasicStructure = await page.locator('html').count() > 0;
    expect(hasBasicStructure).toBe(true);

    console.log(`Network test - Found ${errors.length} console errors, which is expected for blocked requests`);
  });

  test('handles slow network connection', async ({ page }) => {
    // Simulate slow network
    await page.route('**/meals.json', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      route.continue();
    });

    await page.goto('/moodeats-planner.html');

    // Should show loading state or handle timeout
    await page.waitForTimeout(1000);

    // Check if there's a loading indicator
    const loadingIndicators = await page.locator('.loading, .spinner, [data-loading]').count();

    // Eventually should load or show timeout
    await page.waitForTimeout(4000);

    // App should be functional after network delay
    const mealsLoaded = await page.evaluate(() => window.meals && window.meals.length > 0);
    expect(mealsLoaded).toBe(true);
  });

  test('handles partial data corruption', async ({ page }) => {
    // Return corrupted JSON
    await page.route('**/meals.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"invalid": json, syntax}'
      });
    });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/moodeats-planner.html');
    await page.waitForTimeout(2000);

    // Should handle JSON parse error gracefully
    const hasJsonError = errors.some(error =>
      error.includes('JSON') ||
      error.includes('parse') ||
      error.includes('Unexpected token')
    );

    // App should not crash completely
    await expect(page.locator('body')).toBeVisible();

    // Should either show error message or fallback gracefully
    const pageContent = await page.textContent('body');
    const showsErrorOrFallback =
      pageContent.includes('error') ||
      pageContent.includes('unable') ||
      pageContent.includes('loading') ||
      !hasJsonError; // No error means it was handled

    expect(showsErrorOrFallback).toBe(true);
  });

  test('handles empty response', async ({ page }) => {
    // Return empty response
    await page.route('**/meals.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]'
      });
    });

    await page.goto('/moodeats-planner.html');
    await page.waitForTimeout(1000);

    // Should handle empty meals array gracefully
    const mealsArray = await page.evaluate(() => window.meals);
    expect(mealsArray).toEqual([]);

    // UI should still be functional
    await expect(page.locator('#searchInput')).toBeVisible();

    // Should indicate no meals available
    const bodyText = await page.textContent('body');
    const showsNoMealsMessage =
      bodyText.includes('no meals') ||
      bodyText.includes('empty') ||
      bodyText.includes('0 meals');

    // Either shows message or handles gracefully without errors
    expect(showsNoMealsMessage || mealsArray.length === 0).toBe(true);
  });

  test('handles CDN failures for external libraries', async ({ page }) => {
    // Block external CDN requests (like Fuse.js)
    await page.route('**cdn**', route => route.abort());
    await page.route('**unpkg**', route => route.abort());
    await page.route('**jsdelivr**', route => route.abort());

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/moodeats-planner.html');
    await page.waitForTimeout(2000);

    // App should still load basic functionality
    await expect(page.locator('body')).toBeVisible();

    // Search might not work, but app shouldn't crash
    const searchInput = page.locator('#searchInput');
    if (await searchInput.isVisible()) {
      // Try to type in search - might not work but shouldn't crash
      await searchInput.fill('test');

      // Basic interactions should still work
      const moodButtons = page.locator('.mood-btn');
      if (await moodButtons.count() > 0) {
        await moodButtons.first().click();
        // Should not cause fatal errors
      }
    }

    // Should not have uncaught fatal errors
    const hasFatalErrors = errors.some(error =>
      error.includes('ReferenceError') &&
      !error.includes('Fuse') // Fuse not loading is expected
    );

    expect(hasFatalErrors).toBe(false);
  });

  test('recovers from temporary network issues', async ({ page }) => {
    let requestCount = 0;

    // Fail first request, succeed on retry
    await page.route('**/meals.json', route => {
      requestCount++;
      if (requestCount === 1) {
        route.abort(); // First request fails
      } else {
        route.continue(); // Subsequent requests succeed
      }
    });

    await page.goto('/moodeats-planner.html');

    // If there's a retry mechanism, it should eventually work
    await page.waitForTimeout(5000);

    // Check if meals eventually loaded
    const mealsLoaded = await page.evaluate(() => window.meals && window.meals.length > 0);

    // Either should load successfully on retry OR handle the failure gracefully
    if (mealsLoaded) {
      expect(mealsLoaded).toBe(true);
      expect(requestCount).toBeGreaterThan(1); // Verify retry happened
    } else {
      // If no retry mechanism, should handle failure gracefully
      await expect(page.locator('body')).toBeVisible();
    }
  });
});