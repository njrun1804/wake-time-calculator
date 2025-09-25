import { test, expect } from '@playwright/test';

test.describe('Modular wake time calculator', () => {
  test('calculates wake windows when adjusting inputs', async ({ page }) => {
    await page.goto('/index-modular.html');

    await expect(page.locator('#chosenWake')).toHaveText('7:45 AM');
    await expect(page.locator('#latestWake')).toHaveText('7:45 AM');
    await expect(page.locator('#runStart')).toHaveText('7:45 AM');

    const runMinutes = page.locator('#runMinutes');
    await runMinutes.fill('50');

    await page.selectOption('#breakfastMinutes', '10');
    await page.selectOption('#runLocation', 'figure8');

    await expect(page.locator('#travelMinutes')).toHaveValue('14');

    await expect(page.locator('#chosenWake')).toHaveText('6:31 AM');
    await expect(page.locator('#latestWake')).toHaveText('6:55 AM');
    await expect(page.locator('#runStart')).toHaveText('6:41 AM');
  });
});
