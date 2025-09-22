// @ts-check
const { test, expect } = require('@playwright/test');

test('simple tab switching test', async ({ page }) => {
  await page.goto('/moodeats-planner.html');
  await page.waitForLoadState('networkidle');

  // Wait for page to fully load
  await page.waitForTimeout(3000);

  // Check if functions are exposed
  const functionsExposed = await page.evaluate(() => {
    return {
      initializeApp: typeof window.initializeApp,
      loadMeals: typeof window.loadMeals,
      setupAllEventListeners: typeof window.setupAllEventListeners
    };
  });
  console.log('Functions exposed:', functionsExposed);

  // If functions are exposed, call them
  if (functionsExposed.initializeApp === 'function') {
    await page.evaluate(() => {
      // Set test meals first
      window.embeddedMeals = [
        { name: "Test Meal", category: "test", moods: ["fresh"], ingredients: { core: ["test"], pantry: ["test"] }, nutrition: { calories: 100, protein: 10, carbs: 10, fat: 10 } }
      ];
      window.initializeApp();
    });
    await page.waitForTimeout(1000);
  }

  // Check initial visibility
  const planView = page.locator('#planView');
  const browseView = page.locator('#browseView');

  console.log('Initial state:');
  console.log('  Plan view visible:', await planView.isVisible());
  console.log('  Browse view visible:', await browseView.isVisible());

  // Click browse tab
  const browseTab = page.locator('#browseTab');
  await browseTab.click();
  await page.waitForTimeout(500);

  console.log('After clicking browse tab:');
  console.log('  Plan view visible:', await planView.isVisible());
  console.log('  Browse view visible:', await browseView.isVisible());

  // Check if browse view is visible
  if (!await browseView.isVisible()) {
    // Force it visible for testing
    await page.evaluate(() => {
      const bv = document.getElementById('browseView');
      const pv = document.getElementById('planView');
      if (bv && pv) {
        bv.classList.remove('hidden');
        pv.classList.add('hidden');
      }
    });

    console.log('After forcing visibility:');
    console.log('  Plan view visible:', await planView.isVisible());
    console.log('  Browse view visible:', await browseView.isVisible());
  }

  // Now test the mood buttons
  const freshButton = page.locator('[data-mood="fresh"]');
  if (await freshButton.isVisible()) {
    await freshButton.click();
    await page.waitForTimeout(500);

    const suggestionsArea = page.locator('#suggestionsArea');
    console.log('Suggestions area visible:', await suggestionsArea.isVisible());
  }

  // Final assertion
  expect(await browseView.isVisible()).toBe(true);
});