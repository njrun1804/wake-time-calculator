const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🌐 Testing https://njrun1804.github.io/moodeats/');
  await page.goto('https://njrun1804.github.io/moodeats/');
  
  // Check title
  const title = await page.title();
  console.log('✓ Title:', title);
  
  // Check if app initialized
  const mealsCount = await page.evaluate(() => window.meals ? window.meals.length : 0);
  console.log('✓ Meals loaded:', mealsCount);
  
  // Check if tabs exist
  const planTab = await page.isVisible('#planTab');
  const browseTab = await page.isVisible('#browseTab');
  console.log('✓ Plan tab visible:', planTab);
  console.log('✓ Browse tab visible:', browseTab);
  
  // Try clicking browse tab
  await page.click('#browseTab');
  await page.waitForTimeout(500);
  
  const browseViewVisible = await page.isVisible('#browseView');
  console.log('✓ Browse view works:', browseViewVisible);
  
  // Try clicking a mood button
  await page.click('[data-mood="fresh"]');
  await page.waitForTimeout(500);
  
  const suggestionsVisible = await page.isVisible('#suggestionsArea');
  console.log('✓ Mood buttons work:', suggestionsVisible);
  
  if (mealsCount > 0 && planTab && browseTab && browseViewVisible && suggestionsVisible) {
    console.log('\n✅ Site is working perfectly at https://njrun1804.github.io/moodeats/');
  } else {
    console.log('\n⚠️ Some features may not be working');
  }
  
  await browser.close();
})();
