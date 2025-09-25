import { test, expect } from '@playwright/test';

test.describe('Wake time calculator – core planner @core', () => {
  test('adjusts outputs when itinerary changes', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('#chosenWake')).toHaveText('7:45 AM');

    await page.fill('#runMinutes', '50');
    await page.selectOption('#breakfastMinutes', '10');
    await page.selectOption('#runLocation', 'figure8');

    await expect(page.locator('#travelMinutes')).toHaveValue('14');
    await expect(page.locator('#chosenWake')).toHaveText('6:31 AM');
    await expect(page.locator('#latestWake')).toHaveText('6:55 AM');
    await expect(page.locator('#runStart')).toHaveText('6:41 AM');
  });

  test('highlights previous-day wake times for long plans', async ({ page }) => {
    await page.goto('/index.html');

    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '240');
    await page.selectOption('#breakfastMinutes', '45');
    await page.selectOption('#runLocation', 'holmdel');

    await expect(page.locator('#prevDayBadge')).toBeVisible();
    await expect(page.locator('#chosenWake')).toHaveText('11:40 PM');
  });
});
