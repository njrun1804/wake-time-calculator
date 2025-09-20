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

  // Fill in the form to test latest wake calculation
  await page.selectOption('#firstMeeting', '08:00');
  await page.fill('#runMinutes', '40');
  await page.selectOption('#runLocation', 'huber');
  await page.selectOption('#breakfastMinutes', '45');

  // Wait for calculation
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'wake-updated.png', fullPage: true });

  console.log('Screenshot saved as wake-updated.png');
  console.log('\nWake time display:', await page.textContent('#chosenWake'));
  console.log('Latest wake:', await page.textContent('#latestWake'));
  console.log('Run start:', await page.textContent('#runStart'));

  // Check if daylight warning is visible
  const badge = await page.locator('#locHeadlamp');
  const badgeVisible = await badge.isVisible();

  if (badgeVisible) {
    console.log('Daylight check:', await badge.textContent());
  } else {
    console.log('No daylight warning (running after dawn)');
  }

  await browser.close();
})();