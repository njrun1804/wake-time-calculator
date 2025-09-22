import { test, expect } from '@playwright/test';

test('debug previous day calculation', async ({ page }) => {
  await page.goto('/index-modular.html');

  // Set the same values as the failing test
  await page.selectOption('#firstMeeting', '06:00');
  await page.fill('#runMinutes', '180'); // 3 hours
  await page.selectOption('#breakfastMinutes', '45');
  await page.selectOption('#runLocation', 'holmdel'); // 50 min travel

  // Wait for calculation
  await page.waitForTimeout(500);

  // Check the actual wake time and badge visibility
  const wakeTime = await page.locator('#chosenWake').textContent();
  const badgeVisible = await page.locator('#prevDayBadge').isVisible();
  const badgeClass = await page.locator('#prevDayBadge').getAttribute('class');

  console.log('Wake time:', wakeTime);
  console.log('Badge visible:', badgeVisible);
  console.log('Badge class:', badgeClass);

  // Let's try an even earlier meeting time to force previous day
  await page.selectOption('#firstMeeting', '06:00');
  await page.fill('#runMinutes', '300'); // 5 hours

  await page.waitForTimeout(500);

  const wakeTime2 = await page.locator('#chosenWake').textContent();
  const badgeVisible2 = await page.locator('#prevDayBadge').isVisible();

  console.log('Wake time with 5h run:', wakeTime2);
  console.log('Badge visible with 5h run:', badgeVisible2);
});