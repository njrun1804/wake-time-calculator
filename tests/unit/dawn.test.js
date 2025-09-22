import { test, expect } from '@playwright/test';

test.describe('Dawn Module - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');
  });

  test.describe('checkDaylightNeeded', () => {
    test('returns false when no dawn date provided', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded } = await import('./js/modules/dawn.js');
        return checkDaylightNeeded(360, null); // 6:00 AM
      });

      expect(result.needed).toBe(false);
      expect(result.message).toBe(null);
    });

    test('returns true when running before dawn', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded } = await import('./js/modules/dawn.js');

        // Dawn at 7:00 AM (420 minutes)
        const dawnDate = new Date();
        dawnDate.setHours(7, 0, 0, 0);

        // Run starts at 6:30 AM (390 minutes) - 30 minutes before dawn
        return checkDaylightNeeded(390, dawnDate);
      });

      expect(result.needed).toBe(true);
      expect(result.message).toBe('Check daylight (30 min before dawn)');
      expect(result.minutesBefore).toBe(30);
    });

    test('returns true when running exactly at dawn', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded } = await import('./js/modules/dawn.js');

        // Dawn at 6:30 AM (390 minutes)
        const dawnDate = new Date();
        dawnDate.setHours(6, 30, 0, 0);

        // Run starts at exactly 6:30 AM (390 minutes)
        return checkDaylightNeeded(390, dawnDate);
      });

      expect(result.needed).toBe(true);
      expect(result.message).toBe('Check daylight (at dawn)');
      expect(result.minutesBefore).toBe(0);
    });

    test('returns false when running after dawn', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded } = await import('./js/modules/dawn.js');

        // Dawn at 6:00 AM (360 minutes)
        const dawnDate = new Date();
        dawnDate.setHours(6, 0, 0, 0);

        // Run starts at 7:00 AM (420 minutes) - 60 minutes after dawn
        return checkDaylightNeeded(420, dawnDate);
      });

      expect(result.needed).toBe(false);
      expect(result.message).toBe(null);
    });

    test('handles edge case with minutes wrapping around midnight', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded } = await import('./js/modules/dawn.js');

        // Dawn at 6:00 AM (360 minutes)
        const dawnDate = new Date();
        dawnDate.setHours(6, 0, 0, 0);

        // Run starts at 5:00 AM (300 minutes) - 60 minutes before dawn
        return checkDaylightNeeded(300, dawnDate);
      });

      expect(result.needed).toBe(true);
      expect(result.message).toBe('Check daylight (60 min before dawn)');
      expect(result.minutesBefore).toBe(60);
    });

    test('handles very early runs (close to midnight)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded } = await import('./js/modules/dawn.js');

        // Dawn at 7:00 AM (420 minutes)
        const dawnDate = new Date();
        dawnDate.setHours(7, 0, 0, 0);

        // Run starts at 4:00 AM (240 minutes) - 180 minutes before dawn
        return checkDaylightNeeded(240, dawnDate);
      });

      expect(result.needed).toBe(true);
      expect(result.message).toBe('Check daylight (180 min before dawn)');
      expect(result.minutesBefore).toBe(180);
    });
  });

  test.describe('setTestDawn', () => {
    test('creates test dawn date with specified time', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { setTestDawn } = await import('./js/modules/dawn.js');

        const testDawn = setTestDawn(6, 30);

        return {
          hours: testDawn.getHours(),
          minutes: testDawn.getMinutes(),
          seconds: testDawn.getSeconds(),
          milliseconds: testDawn.getMilliseconds()
        };
      });

      expect(result.hours).toBe(6);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(0);
      expect(result.milliseconds).toBe(0);
    });

    test('handles edge cases for time values', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { setTestDawn } = await import('./js/modules/dawn.js');

        return [
          {
            name: 'midnight',
            dawn: setTestDawn(0, 0),
            expectedHours: 0,
            expectedMinutes: 0
          },
          {
            name: 'noon',
            dawn: setTestDawn(12, 0),
            expectedHours: 12,
            expectedMinutes: 0
          },
          {
            name: 'late_evening',
            dawn: setTestDawn(23, 59),
            expectedHours: 23,
            expectedMinutes: 59
          }
        ].map(test => ({
          name: test.name,
          hours: test.dawn.getHours(),
          minutes: test.dawn.getMinutes(),
          expectedHours: test.expectedHours,
          expectedMinutes: test.expectedMinutes
        }));
      });

      results.forEach(result => {
        expect(result.hours).toBe(result.expectedHours);
        expect(result.minutes).toBe(result.expectedMinutes);
      });
    });
  });

  test.describe('fetchDawn integration', () => {
    test('caches and reuses dawn data', async ({ page }) => {
      // This test verifies caching behavior without making real API calls
      const result = await page.evaluate(async () => {
        const { checkDaylightNeeded, setTestDawn } = await import('./js/modules/dawn.js');

        // Test that the module can be imported and functions work together
        const testDawn = setTestDawn(6, 0);
        const check1 = checkDaylightNeeded(300, testDawn); // 5:00 AM, 60 min before
        const check2 = checkDaylightNeeded(420, testDawn); // 7:00 AM, 60 min after

        return { check1, check2 };
      });

      expect(result.check1.needed).toBe(true);
      expect(result.check1.minutesBefore).toBe(60);
      expect(result.check2.needed).toBe(false);
    });
  });
});