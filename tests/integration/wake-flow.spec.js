import { test, expect } from '@playwright/test';

test.describe('Wake Time Calculator @modular', () => {
  test('calculates a wake up plan when the schedule changes @regression', async ({ page }) => {
    await page.goto('/index-modular.html');

    await expect(page.locator('h1')).toHaveText('Wake Time Calculator');
    await expect(page.locator('#chosenWake')).toHaveText('7:45 AM');

    await page.fill('#runMinutes', '60');
    await page.selectOption('#breakfastMinutes', '20');
    await page.selectOption('#runLocation', 'huber');

    await expect(page.locator('#chosenWake')).toHaveText('6:05 AM');
    await expect(page.locator('#latestWake')).toHaveText('6:45 AM');
    await expect(page.locator('#runStart')).toHaveText('6:25 AM');

    await expect(page.locator('#prevDayBadge')).toBeHidden();
    await expect(page.locator('#runBarText')).toHaveText('Run 60m');
    await expect(page.locator('#travelBarText')).toHaveText('Travel 20m');
  });

  test('shows the previous day badge for long itineraries @edge', async ({ page }) => {
    await page.goto('/index-modular.html');

    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '240');
    await page.selectOption('#breakfastMinutes', '45');
    await page.selectOption('#runLocation', 'holmdel');

    await expect(page.locator('#prevDayBadge')).toBeVisible();
    await expect(page.locator('#chosenWake')).toHaveText('11:40 PM');
  });
});
