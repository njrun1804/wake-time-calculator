const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Add console logging
  page.on('console', msg => console.log('Console:', msg.text()));

  console.log('Navigating to page...');
  await page.goto('http://localhost:8000/moodeats-planner.html');

  console.log('Checking if embeddedMeals exists...');
  const hasEmbeddedMeals = await page.evaluate(() => typeof embeddedMeals !== 'undefined');
  console.log('embeddedMeals exists:', hasEmbeddedMeals);

  console.log('Checking if loadMeals function exists...');
  const hasLoadMeals = await page.evaluate(() => typeof loadMeals !== 'undefined');
  console.log('loadMeals exists:', hasLoadMeals);

  console.log('Checking if meals variable exists (not on window)...');
  const hasMeals = await page.evaluate(() => typeof meals !== 'undefined');
  console.log('meals exists:', hasMeals);

  // Try to run initialization manually
  console.log('Trying to run initialization manually...');
  try {
    await page.evaluate(() => {
      if (typeof initializeApp === 'function') {
        initializeApp();
        return 'initializeApp called';
      } else if (typeof loadMeals === 'function') {
        loadMeals();
        return 'loadMeals called';
      } else {
        return 'No initialization function found';
      }
    }).then(result => console.log('Result:', result));
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Check again after manual init
  const mealsOnWindow = await page.evaluate(() => window.meals && window.meals.length);
  console.log('window.meals after init:', mealsOnWindow);

  await browser.close();
})();