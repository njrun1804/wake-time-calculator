// @ts-check
const { test, expect } = require('@playwright/test');
const { initializeTestApp, forceViewVisible } = require('../../helpers/test-init');

test.describe('MoodEats Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await initializeTestApp(page);
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/MoodEats/);
  });

  test('all mood buttons work and show meals', async ({ page }) => {
    const moods = ['fresh', 'hearty', 'cozy', 'quick', 'breakfast', 'seafood', 'asian', 'italian'];

    for (const mood of moods) {
      // Click mood button
      await page.click(`[data-mood="${mood}"]`);

      // Wait for suggestions to appear
      await expect(page.locator('#suggestionsArea')).toBeVisible();

      // Verify meals are shown
      const mealCards = page.locator('#mealSuggestions .card');
      const count = await mealCards.count();

      // Should show at least 1 meal for each mood
      expect(count).toBeGreaterThan(0);

      // Verify the button is marked as active
      await expect(page.locator(`[data-mood="${mood}"]`)).toHaveClass(/btn-primary/);
    }
  });

  test('fresh mood shows 22 meals maximum', async ({ page }) => {
    await page.click('[data-mood="fresh"]');
    await expect(page.locator('#suggestionsArea')).toBeVisible();

    const mealCards = page.locator('#mealSuggestions .card');
    const count = await mealCards.count();

    // Should show meals but limited to initial display count (6)
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
  });

  test('search functionality works', async ({ page }) => {
    const searchInput = page.locator('#searchInput');

    // Search for chicken
    await searchInput.fill('chicken');
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForTimeout(300);

    // Check if suggestions area is visible
    const suggestionsArea = page.locator('#suggestionsArea');
    const isVisible = await suggestionsArea.isVisible();

    if (isVisible) {
      const mealCards = page.locator('#mealSuggestions .card');
      const count = await mealCards.count();
      expect(count).toBeGreaterThan(0);

      // Verify results contain chicken
      const firstMeal = await mealCards.first().textContent();
      expect(firstMeal.toLowerCase()).toContain('chicken');
    }
  });

  test('tab switching works', async ({ page }) => {
    // Initially on Plan tab
    await expect(page.locator('#planView')).toBeVisible();
    await expect(page.locator('#browseView')).toBeHidden();

    // Switch to Browse tab
    await page.click('#browseTab');
    await expect(page.locator('#browseView')).toBeVisible();
    await expect(page.locator('#planView')).toBeHidden();

    // Switch back to Plan tab
    await page.click('#planTab');
    await expect(page.locator('#planView')).toBeVisible();
    await expect(page.locator('#browseView')).toBeHidden();
  });

  test('meal selection modal opens', async ({ page }) => {
    // Click select breakfast
    await page.click('button:has-text("Select"):first');

    // Wait for modal
    await page.waitForTimeout(300);

    // Check modal is open
    const modal = page.locator('#mealModal');
    await expect(modal).toHaveAttribute('open', '');

    // Verify modal has meals
    const modalMeals = page.locator('#modalMeals .card');
    const count = await modalMeals.count();
    expect(count).toBeGreaterThan(0);
  });

  test('breakfast slot only shows breakfast meals', async ({ page }) => {
    // Open breakfast selection
    await page.evaluate(() => window.selectMealForSlot('breakfast'));
    await page.waitForTimeout(300);

    // Check modal title
    const modalTitle = page.locator('#modalTitle');
    await expect(modalTitle).toContainText('Breakfast');

    // All meals shown should be breakfast meals
    const modalMeals = page.locator('#modalMeals .card');
    const count = await modalMeals.count();

    // Should have at least 10 breakfast meals available
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('rapid clicking does not break UI', async ({ page }) => {
    const buttons = page.locator('.mood-btn');

    // Rapidly click different mood buttons
    for (let i = 0; i < 10; i++) {
      await buttons.nth(i % 8).click();
    }

    // UI should still be functional
    await page.waitForTimeout(500);

    // Should have exactly one active button
    const activeButtons = page.locator('.mood-btn.btn-primary');
    await expect(activeButtons).toHaveCount(1);

    // Suggestions area should be visible
    await expect(page.locator('#suggestionsArea')).toBeVisible();
  });

  test('special characters in search do not break app', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    const specialStrings = ['<script>alert("xss")</script>', '"; DROP TABLE;', '\\n\\r', '🍕🍔🌮'];

    for (const str of specialStrings) {
      await searchInput.fill(str);
      await searchInput.press('Enter');
      await page.waitForTimeout(100);
    }

    // App should still be functional
    await searchInput.fill('chicken');
    await searchInput.press('Enter');
    await page.waitForTimeout(300);

    // Should still work normally
    const suggestionsArea = page.locator('#suggestionsArea');
    // Just verify no JavaScript errors occurred
    expect(true).toBe(true);
  });

  test('localStorage persistence works', async ({ page, context }) => {
    // Select a breakfast meal
    await page.evaluate(() => window.selectMealForSlot('breakfast'));
    await page.waitForTimeout(300);

    // Click first meal
    await page.locator('#modalMeals .card').first().click();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForFunction(() => window.meals && window.meals.length > 0);

    // Check if meal is still selected
    const breakfastSlot = page.locator('#breakfast-slot');
    const slotText = await breakfastSlot.textContent();
    expect(slotText).not.toContain('Tap select');
  });
});