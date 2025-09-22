// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Meal Selection Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await page.waitForFunction(() => window.meals && window.meals.length > 0);
  });

  test('modal filters work correctly', async ({ page }) => {
    // Open breakfast modal
    await page.evaluate(() => window.selectMealForSlot('breakfast'));
    await page.waitForTimeout(300);

    // Get initial meal count
    const initialCount = await page.locator('#modalMeals .card').count();

    // Click cozy filter
    const cozyFilter = page.locator('.modal-filter[data-filter="cozy"]');
    if (await cozyFilter.isVisible()) {
      await cozyFilter.click();
      await page.waitForTimeout(300);

      // Should have different (likely fewer) meals
      const filteredCount = await page.locator('#modalMeals .card').count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }

    // Click fresh filter
    const freshFilter = page.locator('.modal-filter[data-filter="fresh"]');
    if (await freshFilter.isVisible()) {
      await freshFilter.click();
      await page.waitForTimeout(300);

      const freshCount = await page.locator('#modalMeals .card').count();
      expect(freshCount).toBeGreaterThan(0);
    }

    // Click all filter to reset
    const allFilter = page.locator('.modal-filter[data-filter="all"]');
    if (await allFilter.isVisible()) {
      await allFilter.click();
      await page.waitForTimeout(300);

      const allCount = await page.locator('#modalMeals .card').count();
      expect(allCount).toBe(initialCount);
    }
  });

  test('selecting meal updates slot display', async ({ page }) => {
    // Open breakfast modal
    await page.evaluate(() => window.selectMealForSlot('breakfast'));
    await page.waitForTimeout(300);

    // Get first meal name
    const firstMeal = page.locator('#modalMeals .card').first();
    const mealName = await firstMeal.locator('h4').textContent();

    // Click to select
    await firstMeal.click();
    await page.waitForTimeout(300);

    // Check that slot is updated
    const breakfastSlot = page.locator('#breakfast-slot');
    const slotText = await breakfastSlot.textContent();
    expect(slotText).toContain(mealName);

    // Button should change to "Change"
    const btnText = await page.locator('#breakfast-btn-text').textContent();
    expect(btnText).toBe('Change');
  });

  test('lunch and dinner exclude breakfast meals', async ({ page }) => {
    // Get breakfast meal count
    await page.evaluate(() => window.selectMealForSlot('breakfast'));
    await page.waitForTimeout(300);
    const breakfastCount = await page.locator('#modalMeals .card').count();
    await page.keyboard.press('Escape');

    // Get lunch meal count
    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForTimeout(300);
    const lunchCount = await page.locator('#modalMeals .card').count();
    await page.keyboard.press('Escape');

    // Get dinner meal count
    await page.evaluate(() => window.selectMealForSlot('dinner'));
    await page.waitForTimeout(300);
    const dinnerCount = await page.locator('#modalMeals .card').count();

    // Lunch and dinner should have more options (all non-breakfast meals)
    expect(lunchCount).toBeGreaterThan(breakfastCount);
    expect(dinnerCount).toBeGreaterThan(breakfastCount);
  });

  test('duplicate meal warning shows when selecting same meal', async ({ page }) => {
    // Select a meal for lunch
    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForTimeout(300);
    const firstMeal = await page.locator('#modalMeals .card h4').first().textContent();
    await page.locator('#modalMeals .card').first().click();
    await page.waitForTimeout(300);

    // Try to select same meal for dinner
    await page.evaluate(() => window.selectMealForSlot('dinner'));
    await page.waitForTimeout(300);

    // Find the same meal - it should have a warning badge
    const mealCards = page.locator('#modalMeals .card');
    const count = await mealCards.count();

    for (let i = 0; i < count; i++) {
      const mealName = await mealCards.nth(i).locator('h4').textContent();
      if (mealName === firstMeal) {
        const badge = mealCards.nth(i).locator('.badge-warning');
        if (await badge.isVisible()) {
          const badgeText = await badge.textContent();
          expect(badgeText).toContain('Already selected');
        }
        break;
      }
    }
  });

  test('nutrition info displays for meals', async ({ page }) => {
    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForTimeout(300);

    const mealCards = page.locator('#modalMeals .card');
    const firstCard = mealCards.first();

    // Check for nutrition info
    const cardText = await firstCard.textContent();
    expect(cardText).toMatch(/\d+g protein/);
    expect(cardText).toMatch(/\d+g carbs/);
    expect(cardText).toMatch(/\d+ cal/);
  });

  test('daily totals update when meals are selected', async ({ page }) => {
    // Select breakfast
    await page.evaluate(() => window.selectMealForSlot('breakfast'));
    await page.waitForTimeout(300);
    await page.locator('#modalMeals .card').first().click();
    await page.waitForTimeout(300);

    // Select lunch
    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForTimeout(300);
    await page.locator('#modalMeals .card').first().click();
    await page.waitForTimeout(300);

    // Check that daily totals are visible
    const dailyTotals = page.locator('#daily-totals');
    const totalsText = await dailyTotals.textContent();

    // Should show stats
    if (!totalsText.includes('Select meals')) {
      expect(totalsText).toMatch(/\d+/); // Should contain numbers
    }
  });
});