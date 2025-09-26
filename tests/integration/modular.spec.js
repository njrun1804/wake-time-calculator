import { test, expect } from '@playwright/test';
import { calculateWakeTime } from '../../js/lib/calculator.js';

test.describe('Wake time calculator – core planner @core', () => {
  test('adjusts outputs when itinerary changes', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('#chosenWake')).toHaveText('7:45 AM');

    await page.fill('#runMinutes', '50');
    await page.getByLabel('Yes (30m)').click();
    await page.selectOption('#runLocation', 'figure8');

    await expect(page.locator('#travelMinutes')).toHaveValue('14');

    const expected = calculateWakeTime({
      meeting: '08:30',
      runMinutes: 50,
      travelMinutes: 14,
      breakfastMinutes: 30,
    });

    await expect(page.locator('#chosenWake')).toHaveText(expected.wakeTime12);
    await expect(page.locator('#latestWake')).toHaveText(
      expected.latestWakeTime12
    );
  });

  test('highlights previous-day wake times for long plans', async ({
    page,
  }) => {
    await page.goto('/index.html');

    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '240');
    await page.getByLabel('Yes (30m)').click();
    await page.selectOption('#runLocation', 'holmdel');

    const expected = calculateWakeTime({
      meeting: '06:00',
      runMinutes: 240,
      travelMinutes: 50,
      breakfastMinutes: 30,
    });

    await expect(page.locator('#prevDayBadge')).toBeVisible();
    await expect(page.locator('#chosenWake')).toHaveText(expected.wakeTime12);
  });

  test('shows baseline wake windows for each meeting option', async ({
    page,
  }) => {
    await page.goto('/index.html');

    const meetings = await page.$$eval('#firstMeeting option', (options) =>
      options.map((option) => option.value)
    );

    const expectations = meetings.map((meeting) => ({
      meeting,
      expected: calculateWakeTime({ meeting }),
    }));

    for (const { meeting, expected } of expectations) {
      await page.locator('#wakeForm').evaluate((form) => form.reset());
      await page.fill('#runMinutes', '0');
      await page.selectOption('#runLocation', 'round-town');
      await page.getByLabel('No').click();
      await page.selectOption('#firstMeeting', meeting);

      await expect(page.locator('#chosenWake')).toHaveText(expected.wakeTime12);
      await expect(page.locator('#latestWake')).toHaveText(
        expected.latestWakeTime12
      );
    }
  });
});
