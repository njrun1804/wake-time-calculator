const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('file://' + __dirname + '/wake.html');
  await page.setViewportSize({ width: 1280, height: 800 });

  // First get location for dawn data
  await page.click('text="Use my location"');
  await page.waitForTimeout(2000); // Wait for location and dawn data

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

  // Check if daylight check badge is visible
  const badge = await page.locator('#locHeadlamp');
  const isVisible = await badge.isVisible();
  if (isVisible) {
    console.log('Daylight check badge:', await badge.textContent());
  } else {
    console.log('Daylight check badge: Not visible (running after dawn)');
  }

  await browser.close();
})();