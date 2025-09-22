const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Add error logging
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  // Add console logging
  page.on('console', msg => {
    console.log('Console:', msg.text());
  });

  console.log('Navigating to page...');
  await page.goto('http://localhost:8000/moodeats-planner.html');

  // Wait a bit for any initialization
  await page.waitForTimeout(1000);

  console.log('Checking what is defined in the page...');
  const pageInfo = await page.evaluate(() => {
    const info = {};

    // Check if various things exist
    info.hasEmbeddedMeals = typeof embeddedMeals !== 'undefined';
    info.hasMeals = typeof meals !== 'undefined';
    info.hasLoadMeals = typeof loadMeals !== 'undefined';
    info.hasInitializeApp = typeof initializeApp !== 'undefined';
    info.hasSelectMealForSlot = typeof selectMealForSlot !== 'undefined';

    // Check window
    info.windowMeals = window.meals ? window.meals.length : 'undefined';
    info.windowSelectMealForSlot = typeof window.selectMealForSlot;

    // Try to get embeddedMeals length if it exists
    if (typeof embeddedMeals !== 'undefined') {
      info.embeddedMealsLength = embeddedMeals.length;
    }

    // Try to get meals length if it exists
    if (typeof meals !== 'undefined') {
      info.mealsLength = Array.isArray(meals) ? meals.length : 'not array';
    }

    return info;
  });

  console.log('Page info:', JSON.stringify(pageInfo, null, 2));

  // Try calling initializeApp
  console.log('\nTrying to call initializeApp...');
  try {
    await page.evaluate(() => {
      if (typeof initializeApp === 'function') {
        initializeApp();
      }
    });

    // Check again
    const afterInit = await page.evaluate(() => ({
      windowMeals: window.meals ? window.meals.length : 'undefined',
      meals: typeof meals !== 'undefined' ? meals.length : 'undefined'
    }));
    console.log('After initializeApp:', afterInit);
  } catch (e) {
    console.log('Error calling initializeApp:', e.message);
  }

  await browser.close();
})();