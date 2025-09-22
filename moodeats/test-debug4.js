const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Add console logging
  page.on('console', msg => {
    if (msg.text().includes('Loading meals') || msg.text().includes('window.meals')) {
      console.log('Console:', msg.text());
    }
  });

  console.log('Navigating to page...');
  await page.goto('http://localhost:8000/moodeats-planner.html');

  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');

  console.log('Checking if loadMeals was called...');

  // Try to call loadMeals directly
  const loadMealsResult = await page.evaluate(() => {
    if (typeof loadMeals === 'function') {
      loadMeals();
      return 'loadMeals called';
    }
    return 'loadMeals not found';
  });
  console.log('Result:', loadMealsResult);

  // Check window.meals
  const checkMeals = await page.evaluate(() => {
    return {
      windowMeals: window.meals ? window.meals.length : 'not defined',
      meals: typeof meals !== 'undefined' ? meals.length : 'not defined'
    };
  });
  console.log('Meals check:', checkMeals);

  // Try to manually set window.meals
  console.log('\nTrying to manually set window.meals...');
  await page.evaluate(() => {
    if (typeof meals !== 'undefined' && !window.meals) {
      window.meals = meals;
      console.log('Manually set window.meals to', meals.length, 'items');
    }
  });

  // Check again
  const finalCheck = await page.evaluate(() => {
    return {
      windowMeals: window.meals ? window.meals.length : 'not defined',
      windowSelectMealForSlot: typeof window.selectMealForSlot
    };
  });
  console.log('Final check:', finalCheck);

  await browser.close();
})();