const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to page...');
  await page.goto('http://localhost:8000/moodeats-planner.html');

  console.log('Waiting for window.meals...');
  try {
    await page.waitForFunction(() => window.meals && window.meals.length > 0, { timeout: 5000 });
    console.log('✓ window.meals is loaded');
    const mealsCount = await page.evaluate(() => window.meals.length);
    console.log(`✓ Found ${mealsCount} meals`);
  } catch (e) {
    console.log('✗ window.meals not found');
    console.log('Checking what is available on window:');
    const windowKeys = await page.evaluate(() => Object.keys(window).filter(k => !k.startsWith('__')).slice(0, 20));
    console.log('Window keys:', windowKeys);
  }

  await browser.close();
})();