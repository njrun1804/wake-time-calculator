import { test, expect } from '@playwright/test';

test.describe('Modular Wake Time Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');
  });

  test('calculates wake time based on sleep cycles @modular', async ({ page }) => {
    // Set wake time to 6:00 AM
    await page.fill('#wakeHour', '6');
    await page.fill('#wakeMinute', '00');

    // Calculate sleep times
    await page.click('#calculate');

    // Verify sleep time recommendations are displayed
    const sleepTimes = page.locator('.sleep-time');
    await expect(sleepTimes).toHaveCount(6);

    // Verify the latest sleep time (9 hours before wake)
    const firstTime = await sleepTimes.first().textContent();
    expect(firstTime).toContain('9:00 PM');
  });

  test('updates time allocation bars @modular', async ({ page }) => {
    // Set wake time
    await page.fill('#wakeHour', '7');
    await page.fill('#wakeMinute', '30');

    // Calculate
    await page.click('#calculate');

    // Check that allocation bars are visible
    const allocationBars = page.locator('.time-allocation');
    await expect(allocationBars.first()).toBeVisible();
  });
});