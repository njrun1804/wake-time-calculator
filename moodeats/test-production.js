// Test production site functionality
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', err => console.error('Page error:', err));

  console.log('Loading production site...');
  await page.goto('https://njrun1804.github.io/moodeats/moodeats-planner.html');

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Check if meals are loaded
  const state = await page.evaluate(() => {
    return {
      meals: window.meals ? window.meals.length : 'undefined',
      embeddedMeals: window.embeddedMeals ? window.embeddedMeals.length : 'undefined',
      initializeApp: typeof window.initializeApp,
      setupAllEventListeners: typeof window.setupAllEventListeners,
      browseTab: document.getElementById('browseTab') ? 'found' : 'not found',
      browseView: document.getElementById('browseView')?.className || 'not found'
    };
  });

  console.log('Initial state:', state);

  // Try clicking browse tab
  console.log('\nClicking Browse tab...');
  await page.click('#browseTab');
  await page.waitForTimeout(1000);

  const afterClick = await page.evaluate(() => {
    return {
      browseView: document.getElementById('browseView')?.className || 'not found',
      planView: document.getElementById('planView')?.className || 'not found'
    };
  });

  console.log('After clicking Browse tab:', afterClick);

  // Try forcing initialization
  console.log('\nForcing initialization...');
  await page.evaluate(() => {
    if (typeof window.initializeApp === 'function') {
      console.log('Calling initializeApp()');
      window.initializeApp();
    }
  });

  await page.waitForTimeout(2000);

  const afterInit = await page.evaluate(() => {
    return {
      meals: window.meals ? window.meals.length : 'undefined',
      embeddedMeals: window.embeddedMeals ? window.embeddedMeals.length : 'undefined'
    };
  });

  console.log('After forcing init:', afterInit);

  // Try clicking browse tab again
  console.log('\nClicking Browse tab again...');
  await page.click('#browseTab');
  await page.waitForTimeout(1000);

  const finalState = await page.evaluate(() => {
    return {
      browseView: document.getElementById('browseView')?.className || 'not found',
      planView: document.getElementById('planView')?.className || 'not found'
    };
  });

  console.log('Final state:', finalState);

  // Check for any mood buttons
  const moodButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.mood-btn');
    return buttons.length;
  });

  console.log('\nMood buttons found:', moodButtons);

  await browser.close();
})();