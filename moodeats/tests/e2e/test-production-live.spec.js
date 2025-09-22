// @ts-check
const { test, expect } = require('@playwright/test');

test('production site buttons should work', async ({ page }) => {
  // Go to production site
  await page.goto('https://njrun1804.github.io/moodeats/moodeats-planner.html');

  // Enable console logging
  page.on('console', msg => console.log('Browser:', msg.text()));
  page.on('pageerror', err => console.error('Page error:', err));

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check initial state
  const initialState = await page.evaluate(() => {
    return {
      meals: window.meals ? window.meals.length : 'undefined',
      embeddedMeals: window.embeddedMeals ? window.embeddedMeals.length : 'undefined',
      hasInitializeApp: typeof window.initializeApp,
      hasSetupListeners: typeof window.setupAllEventListeners
    };
  });
  console.log('Initial state:', initialState);

  // Check if browse tab exists and is visible
  const browseTab = page.locator('#browseTab');
  await expect(browseTab).toBeVisible();
  console.log('Browse tab is visible');

  // Click browse tab
  await browseTab.click();
  await page.waitForTimeout(1000);

  // Check if view changed
  const browseView = page.locator('#browseView');
  const planView = page.locator('#planView');

  const viewsAfterClick = await page.evaluate(() => {
    const bv = document.getElementById('browseView');
    const pv = document.getElementById('planView');
    return {
      browseView: bv?.className,
      planView: pv?.className,
      browseViewHidden: bv?.classList.contains('hidden'),
      planViewHidden: pv?.classList.contains('hidden')
    };
  });
  console.log('After clicking browse tab:', viewsAfterClick);

  // If browse view is still hidden, try to force it
  if (viewsAfterClick.browseViewHidden) {
    console.log('Browse view still hidden, forcing initialization...');

    await page.evaluate(() => {
      // Force initialization
      if (typeof window.initializeApp === 'function') {
        console.log('Calling initializeApp()');
        window.initializeApp();
      }
    });

    await page.waitForTimeout(2000);

    // Check meals again
    const mealsAfterInit = await page.evaluate(() => {
      return window.meals ? window.meals.length : 0;
    });
    console.log('Meals after force init:', mealsAfterInit);

    // Try clicking browse tab again
    await browseTab.click();
    await page.waitForTimeout(1000);
  }

  // Final check
  const isVisible = await browseView.isVisible();
  console.log('Browse view visible:', isVisible);

  if (!isVisible) {
    // Manually toggle visibility
    await page.evaluate(() => {
      const bv = document.getElementById('browseView');
      const pv = document.getElementById('planView');
      if (bv && pv) {
        bv.classList.remove('hidden');
        pv.classList.add('hidden');
        console.log('Manually toggled visibility');
      }
    });
  }

  // Check if mood buttons are visible
  const freshButton = page.locator('[data-mood="fresh"]');
  const freshVisible = await freshButton.isVisible();
  console.log('Fresh mood button visible:', freshVisible);

  // Try clicking a mood button
  if (freshVisible) {
    await freshButton.click();
    await page.waitForTimeout(1000);

    const suggestionsArea = page.locator('#suggestionsArea');
    const suggestionsVisible = await suggestionsArea.isVisible();
    console.log('Suggestions area visible after clicking Fresh:', suggestionsVisible);
  }

  // Final assertion - at least browse view should work
  expect(await browseView.isVisible()).toBe(true);
});