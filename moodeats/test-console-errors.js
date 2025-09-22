const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages and errors
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`${msg.type()}: ${text}`);
    console.log(`Browser console ${msg.type()}:`, text);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
    console.error('Page error:', err);
  });

  console.log('Loading production site...');
  await page.goto('https://njrun1804.github.io/moodeats/moodeats-planner.html');
  await page.waitForTimeout(3000);

  // Check if there were any errors
  if (pageErrors.length > 0) {
    console.log('\n❌ JavaScript errors found:');
    pageErrors.forEach(err => console.log('  -', err));
  } else {
    console.log('\n✅ No JavaScript errors');
  }

  // Check the state
  const state = await page.evaluate(() => {
    return {
      meals: window.meals ? window.meals.length : 'undefined',
      embeddedMeals: window.embeddedMeals ? window.embeddedMeals.length : 'undefined',
      initializeApp: typeof window.initializeApp,
      setupAllEventListeners: typeof window.setupAllEventListeners,
    };
  });

  console.log('\nPage state:', state);

  // Try clicking browse tab
  console.log('\nClicking Browse tab...');
  try {
    await page.click('#browseTab');
    await page.waitForTimeout(1000);

    const viewState = await page.evaluate(() => {
      const bv = document.getElementById('browseView');
      const pv = document.getElementById('planView');
      return {
        browseVisible: bv && !bv.classList.contains('hidden'),
        planVisible: pv && !pv.classList.contains('hidden')
      };
    });

    console.log('After click:', viewState);

    if (!viewState.browseVisible) {
      console.log('Browse view not visible - buttons are not working!');
    }
  } catch (err) {
    console.error('Error clicking browse tab:', err);
  }

  await browser.close();
})();