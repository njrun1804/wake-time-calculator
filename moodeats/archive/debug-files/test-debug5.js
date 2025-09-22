const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Run with UI for debugging
  const page = await browser.newPage();

  // Add all console logging
  page.on('console', msg => {
    console.log('Console:', msg.text());
  });

  // Add error logging
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  console.log('Navigating to page...');
  await page.goto('http://localhost:8000/moodeats-planner.html');
  await page.waitForLoadState('networkidle');

  // Check if loadMeals was already called
  const beforeCall = await page.evaluate(() => {
    return {
      meals: typeof meals !== 'undefined' ? meals.length : 'not defined',
      windowMeals: window.meals ? window.meals.length : 'not defined',
      embeddedMeals: typeof embeddedMeals !== 'undefined' ? 'exists' : 'not defined'
    };
  });
  console.log('Before calling loadMeals:', beforeCall);

  // Call loadMeals and see what happens
  const loadResult = await page.evaluate(() => {
    try {
      if (typeof loadMeals === 'function') {
        loadMeals();
        return {
          success: true,
          mealsAfter: typeof meals !== 'undefined' ? meals.length : 'not defined',
          windowMealsAfter: window.meals ? window.meals.length : 'not defined'
        };
      }
      return { success: false, reason: 'loadMeals not found' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('Load result:', loadResult);

  // Wait a moment then close
  await page.waitForTimeout(2000);
  await browser.close();
})();