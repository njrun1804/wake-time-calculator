import { test, expect } from '@playwright/test';
import { calculateWakeTime } from '../../js/lib/calculator.js';
import { defaults } from '../../js/lib/constants.js';

const RUN_MINUTES = 42;
const BREAKFAST_MINUTES = 30;
const DEFAULT_MEETING = defaults.firstMeeting;

test.describe('Wake time calculator – full awareness @full', () => {
  test('calculates a wake up plan when the schedule changes @regression', async ({
    page,
  }) => {
    await page.goto('/index.html');

    await expect(page.locator('h1')).toHaveText('Wake Time Calculator');
    await expect(page.locator('#chosenWake')).toHaveText('7:45 AM');

    await page.fill('#runMinutes', '60');
    await page.getByLabel('Yes (30m)').click();
    await page.selectOption('#runLocation', 'huber');

    const expected = calculateWakeTime({
      meeting: DEFAULT_MEETING,
      runMinutes: 60,
      travelMinutes: 20,
      breakfastMinutes: BREAKFAST_MINUTES,
    });

    await expect(page.locator('#chosenWake')).toHaveText(expected.wakeTime12);
    await expect(page.locator('#latestWake')).toHaveText(
      expected.latestWakeTime12
    );

    await expect(page.locator('#prevDayBadge')).toBeHidden();
  });

  test('shows the previous day badge for long itineraries @edge', async ({
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
      breakfastMinutes: BREAKFAST_MINUTES,
    });

    await expect(page.locator('#prevDayBadge')).toBeVisible();
    await expect(page.locator('#chosenWake')).toHaveText(expected.wakeTime12);
  });

  test('synchronizes travel times for every run location option @core', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/index.html');

    await expect(page.locator('#firstMeeting')).toHaveValue(DEFAULT_MEETING);

    await page.fill('#runMinutes', RUN_MINUTES.toString());
    await page.getByLabel('Yes (30m)').click();

    const locationGroups = await page.$$eval(
      '#runLocation optgroup',
      (groups) =>
        groups.map((group) => ({
          label: group.label,
          options: Array.from(group.querySelectorAll('option')).map(
            (option) => ({
              value: option.value,
              travel: Number.parseInt(option.dataset.travel || '0', 10),
              text: option.textContent?.trim() || option.value,
            })
          ),
        }))
    );

    expect(
      locationGroups.some((group) =>
        group.label?.toLowerCase().includes('dirt')
      )
    ).toBeTruthy();
    expect(
      locationGroups.some((group) =>
        group.label?.toLowerCase().includes('no dirt')
      )
    ).toBeTruthy();

    for (const group of locationGroups) {
      for (const option of group.options) {
        await test.step(`${group.label}: ${option.text}`, async () => {
          await page.selectOption('#runLocation', option.value);

          await expect(page.locator('#runLocation')).toHaveValue(option.value);
          await expect(page.locator('#travelMinutes')).toHaveValue(
            option.travel.toString()
          );

          const expected = calculateWakeTime({
            meeting: DEFAULT_MEETING,
            runMinutes: RUN_MINUTES,
            travelMinutes: option.travel,
            breakfastMinutes: BREAKFAST_MINUTES,
          });

          await expect(page.locator('#chosenWake')).toHaveText(
            expected.wakeTime12
          );
          await expect(page.locator('#latestWake')).toHaveText(
            expected.latestWakeTime12
          );
        });
      }
    }
  });
});
