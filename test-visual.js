const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('file://' + __dirname + '/wake.html');
  await page.setViewportSize({ width: 1280, height: 800 });

  // Wait for page to load fully
  await page.waitForTimeout(500);

  // Inject a dawn time for testing (6:16 AM)
  await page.evaluate(() => {
    if (window.setTestDawn) {
      window.setTestDawn(6, 16);
    }
  });

  // Fill in the form to test daylight warning (early meeting = early run)
  await page.selectOption('#firstMeeting', '07:15');
  await page.fill('#runMinutes', '33');
  await page.selectOption('#runLocation', 'allaire');
  await page.selectOption('#breakfastMinutes', '20');

  // Wait for calculation
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'wake-updated.png', fullPage: true });

  console.log('Screenshot saved as wake-updated.png');
  console.log('\nWake time display:', await page.textContent('#chosenWake'));
  console.log('Latest wake:', await page.textContent('#latestWake'));
  console.log('Run start:', await page.textContent('#runStart'));

  // Check if daylight warnings are visible
  const badge = await page.locator('#locHeadlamp');
  const warning = await page.locator('#daylightWarning');

  const badgeVisible = await badge.isVisible();
  const warningVisible = await warning.isVisible();

  if (badgeVisible) {
    console.log('Location badge:', await badge.textContent());
  }
  if (warningVisible) {
    console.log('Daylight warning:', await warning.textContent());
  }
  if (!badgeVisible && !warningVisible) {
    console.log('No daylight warnings (running well after dawn)');
  }

  await browser.close();
})();