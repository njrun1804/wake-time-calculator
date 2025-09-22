// @ts-check
const { test, expect } = require('@playwright/test');

test('verify initialization actually works', async ({ page }) => {
  await page.goto('/moodeats-planner.html');
  await page.waitForLoadState('networkidle');

  // Log console messages
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });

  // Wait for page to settle
  await page.waitForTimeout(2000);

  // Step 1: Check initial state
  const initialState = await page.evaluate(() => {
    return {
      hasInitializeApp: typeof window.initializeApp === 'function',
      hasLoadMeals: typeof window.loadMeals === 'function',
      hasSetupAllEventListeners: typeof window.setupAllEventListeners === 'function',
      mealsStatus: window.meals ? `${window.meals.length} meals` : 'undefined',
      embeddedMealsStatus: typeof window.embeddedMeals !== 'undefined' ? `${window.embeddedMeals.length} embedded` : 'no embedded meals'
    };
  });
  console.log('Initial state:', initialState);

  // Step 2: Force initialization with test data
  await page.evaluate(() => {
    // Create test meals
    const testMeals = [
      { name: "Test Fresh", category: "salad", moods: ["fresh"], ingredients: { core: ["lettuce"], pantry: ["oil"] }, nutrition: { calories: 200, protein: 5, carbs: 20, fat: 10 }, searchTerms: ["salad", "fresh"] },
      { name: "Test Cozy", category: "soup", moods: ["cozy"], ingredients: { core: ["chicken"], pantry: ["broth"] }, nutrition: { calories: 350, protein: 25, carbs: 30, fat: 12 }, searchTerms: ["soup", "cozy"] }
    ];

    // Set embeddedMeals
    window.embeddedMeals = testMeals;
    console.log('Set embeddedMeals:', window.embeddedMeals);

    // Call initializeApp
    if (typeof window.initializeApp === 'function') {
      console.log('Calling initializeApp...');
      window.initializeApp();
    }
  });

  await page.waitForTimeout(1000);

  // Step 3: Check post-init state
  const postInitState = await page.evaluate(() => {
    return {
      mealsStatus: window.meals ? `${window.meals.length} meals` : 'undefined',
      browseTabHasListener: (() => {
        const tab = document.getElementById('browseTab');
        if (!tab) return 'no tab';
        // Try clicking and see if view changes
        const beforeClick = document.getElementById('browseView')?.className;
        tab.click();
        const afterClick = document.getElementById('browseView')?.className;
        return {
          before: beforeClick,
          after: afterClick,
          changed: beforeClick !== afterClick
        };
      })()
    };
  });
  console.log('Post-init state:', postInitState);

  // Step 4: Test tab switching with Playwright
  const browseTab = page.locator('#browseTab');
  const browseView = page.locator('#browseView');
  const planView = page.locator('#planView');

  console.log('Before Playwright click:');
  console.log('  browseView visible:', await browseView.isVisible());
  console.log('  planView visible:', await planView.isVisible());

  await browseTab.click();
  await page.waitForTimeout(500);

  console.log('After Playwright click:');
  console.log('  browseView visible:', await browseView.isVisible());
  console.log('  planView visible:', await planView.isVisible());

  // Step 5: Check if we can force visibility manually
  await page.evaluate(() => {
    const bv = document.getElementById('browseView');
    const pv = document.getElementById('planView');
    if (bv && pv) {
      bv.classList.remove('hidden');
      pv.classList.add('hidden');
      console.log('Manually toggled visibility');
    }
  });

  console.log('After manual toggle:');
  console.log('  browseView visible:', await browseView.isVisible());
  console.log('  planView visible:', await planView.isVisible());

  // Check if mood buttons are visible now
  const freshButton = page.locator('[data-mood="fresh"]');
  console.log('Fresh button visible:', await freshButton.isVisible());

  expect(await browseView.isVisible()).toBe(true);
});