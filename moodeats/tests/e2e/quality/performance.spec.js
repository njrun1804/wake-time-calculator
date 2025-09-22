// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('page loads within performance budget', async ({ page }) => {
    // Start timing
    const startTime = Date.now();

    await page.goto('/moodeats-planner.html');
    await page.waitForLoadState('domcontentloaded');

    // Try to wait for meals OR proceed if page is functional
    try {
      await page.waitForFunction(() => window.meals && window.meals.length > 0, { timeout: 5000 });
    } catch (error) {
      // Continue with basic page load timing even if meals don't load
      console.log('Meals did not load, measuring basic page load time');
    }

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (generous budget for CI)
    expect(loadTime).toBeLessThan(5000);
  });

  test('renders 76+ meals without performance degradation', async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    const mealCount = await page.evaluate(() => window.meals.length);
    expect(mealCount).toBeGreaterThanOrEqual(70);

    // Test rendering performance by opening modal with all meals
    const startTime = Date.now();

    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForTimeout(100);

    // Wait for modal to be fully populated
    await page.waitForSelector('#modalMeals .card', { timeout: 2000 });

    const renderTime = Date.now() - startTime;

    // Modal rendering should be fast
    expect(renderTime).toBeLessThan(1000);

    // Check that meals are actually rendered
    const modalMealCount = await page.locator('#modalMeals .card').count();
    expect(modalMealCount).toBeGreaterThan(50); // Non-breakfast meals
  });

  test('search performance with large dataset', async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    const searchInput = page.locator('#searchInput');

    // Test search performance
    const startTime = Date.now();

    await searchInput.fill('chicken');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(500);

    const searchTime = Date.now() - startTime;

    // Search should be very fast
    expect(searchTime).toBeLessThan(1000);

    // Should return results
    const suggestionsVisible = await page.locator('#suggestionsArea').isVisible();
    if (suggestionsVisible) {
      const resultCount = await page.locator('#mealSuggestions .card').count();
      expect(resultCount).toBeGreaterThan(0);
    }
  });

  test('rapid mood button clicking performance', async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    const moods = ['fresh', 'hearty', 'cozy', 'quick', 'seafood', 'asian', 'italian'];
    const startTime = Date.now();

    // Rapidly click different mood buttons
    for (let i = 0; i < 20; i++) {
      const mood = moods[i % moods.length];
      await page.click(`[data-mood="${mood}"]`);
      // Small delay to simulate real user behavior
      await page.waitForTimeout(50);
    }

    const totalTime = Date.now() - startTime;

    // 20 rapid clicks should complete quickly
    expect(totalTime).toBeLessThan(3000);

    // UI should be responsive after rapid clicking
    await expect(page.locator('#suggestionsArea')).toBeVisible();
    await expect(page.locator('.mood-btn.btn-primary')).toHaveCount(1);
  });

  test('memory usage stays reasonable', async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Perform memory-intensive operations
    for (let i = 0; i < 10; i++) {
      // Open and close modal multiple times
      await page.evaluate(() => window.selectMealForSlot('lunch'));
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Search multiple times
      await page.fill('#searchInput', `test${i}`);
      await page.press('#searchInput', 'Enter');
      await page.waitForTimeout(100);
      await page.fill('#searchInput', '');
    }

    // Check memory after operations
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;

      // Memory shouldn't increase by more than 50% after operations
      expect(memoryIncreasePercent).toBeLessThan(50);
    }
  });

  test('DOM manipulation performance', async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    // Test modal opening performance
    const modalOpenTimes = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();

      await page.evaluate(() => window.selectMealForSlot('lunch'));
      await page.waitForSelector('#mealModal[open]');

      const openTime = Date.now() - startTime;
      modalOpenTimes.push(openTime);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }

    // All modal opens should be fast
    modalOpenTimes.forEach(time => {
      expect(time).toBeLessThan(500);
    });

    // Performance should be consistent (no degradation)
    const averageTime = modalOpenTimes.reduce((a, b) => a + b, 0) / modalOpenTimes.length;
    const maxTime = Math.max(...modalOpenTimes);
    expect(maxTime).toBeLessThan(averageTime * 2);
  });

  test('mobile viewport performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    const mobileLoadTime = Date.now() - startTime;

    // Mobile should load reasonably fast
    expect(mobileLoadTime).toBeLessThan(4000);

    // Test mobile interactions
    const mobileInteractionStart = Date.now();

    await page.click('[data-mood="fresh"]');
    await page.waitForSelector('#suggestionsArea');

    const interactionTime = Date.now() - mobileInteractionStart;
    expect(interactionTime).toBeLessThan(1000);

    // Modal should work on mobile
    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForSelector('#mealModal[open]');

    const modalMealsCount = await page.locator('#modalMeals .card').count();
    expect(modalMealsCount).toBeGreaterThan(0);
  });

  test('bundle size and resource loading', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length']
      });
    });

    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    // Check that we're not loading too many resources
    const scriptRequests = requests.filter(r => r.resourceType === 'script');
    const stylesheetRequests = requests.filter(r => r.resourceType === 'stylesheet');

    // Should have minimal external dependencies
    expect(scriptRequests.length).toBeLessThan(10);
    expect(stylesheetRequests.length).toBeLessThan(5);

    // Check meals.json size
    const mealsResponse = responses.find(r => r.url.includes('meals.json'));
    if (mealsResponse && mealsResponse.size) {
      const sizeKB = parseInt(mealsResponse.size) / 1024;
      // Meals data should be reasonable size (under 100KB)
      expect(sizeKB).toBeLessThan(100);
    }

    // All critical resources should load successfully
    const failedResponses = responses.filter(r => r.status >= 400);
    expect(failedResponses.length).toBe(0);
  });

  test('CSS animation performance', async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    // Test modal animation performance
    const animationStartTime = Date.now();

    await page.evaluate(() => window.selectMealForSlot('lunch'));

    // Wait for modal to be fully visible (including animations)
    await page.waitForSelector('#mealModal[open]', { state: 'visible' });
    await page.waitForTimeout(300); // Allow for animation completion

    const animationTime = Date.now() - animationStartTime;

    // Animation should complete quickly
    expect(animationTime).toBeLessThan(1000);

    // Modal should be fully interactive
    const modalMeals = page.locator('#modalMeals .card');
    await expect(modalMeals.first()).toBeVisible();

    // Close animation test
    const closeAnimationStart = Date.now();
    await page.keyboard.press('Escape');

    await page.waitForSelector('#mealModal:not([open])', { timeout: 1000 });
    const closeAnimationTime = Date.now() - closeAnimationStart;

    expect(closeAnimationTime).toBeLessThan(500);
  });
});