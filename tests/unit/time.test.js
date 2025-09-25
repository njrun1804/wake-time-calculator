import { test, expect } from '@playwright/test';

test.describe('Time Utilities - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');
  });

  test.describe('fmtTime12InZone', () => {
    test('formats time in 12-hour format with timezone', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fmtTime12InZone } = await import('./js/utils/time.js');

        // Create a test date: 2024-01-01 14:30:00 UTC
        const date = new Date('2024-01-01T14:30:00Z');

        return {
          utc: fmtTime12InZone(date, 'UTC'),
          est: fmtTime12InZone(date, 'America/New_York'),
          pst: fmtTime12InZone(date, 'America/Los_Angeles')
        };
      });

      expect(result.utc).toBe('2:30 PM');
      expect(result.est).toBe('9:30 AM');
      expect(result.pst).toBe('6:30 AM');
    });

    test('handles midnight and noon correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fmtTime12InZone } = await import('./js/utils/time.js');

        const midnight = new Date('2024-01-01T00:00:00Z');
        const noon = new Date('2024-01-01T12:00:00Z');

        return {
          midnight: fmtTime12InZone(midnight, 'UTC'),
          noon: fmtTime12InZone(noon, 'UTC')
        };
      });

      expect(result.midnight).toBe('12:00 AM');
      expect(result.noon).toBe('12:00 PM');
    });
  });

  test.describe('fmtYMDInZone', () => {
    test('formats date as YYYY-MM-DD in timezone', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fmtYMDInZone } = await import('./js/utils/time.js');

        // Create a test date
        const date = new Date('2024-07-15T14:30:00Z');

        return {
          utc: fmtYMDInZone(date, 'UTC'),
          est: fmtYMDInZone(date, 'America/New_York')
        };
      });

      expect(result.utc).toBe('2024-07-15');
      expect(result.est).toBe('2024-07-15');
    });

    test('handles timezone date boundaries', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fmtYMDInZone } = await import('./js/utils/time.js');

        // Date that crosses midnight in different timezones
        const date = new Date('2024-01-01T06:00:00Z');

        return {
          utc: fmtYMDInZone(date, 'UTC'),
          hawaii: fmtYMDInZone(date, 'Pacific/Honolulu'), // UTC-10, should be previous day
          tokyo: fmtYMDInZone(date, 'Asia/Tokyo') // UTC+9, should be same day
        };
      });

      expect(result.utc).toBe('2024-01-01');
      expect(result.hawaii).toBe('2023-12-31');
      expect(result.tokyo).toBe('2024-01-01');
    });
  });

  test.describe('tomorrowYMD', () => {
    test('returns tomorrow date in YYYY-MM-DD format', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { tomorrowYMD } = await import('./js/utils/time.js');

        // Mock Date.now to return a consistent value
        const originalNow = Date.now;
        Date.now = () => new Date('2024-01-01T12:00:00Z').getTime();

        const tomorrow = tomorrowYMD('UTC');

        // Restore Date.now
        Date.now = originalNow;

        return tomorrow;
      });

      expect(result).toBe('2024-01-02');
    });
  });

  test.describe('parseISODate', () => {
    test('parses ISO date string to Date object', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { parseISODate } = await import('./js/utils/time.js');

        const date = parseISODate('2024-01-01T14:30:00Z');

        return {
          year: date.getFullYear(),
          month: date.getMonth(),
          date: date.getDate(),
          hours: date.getUTCHours(),
          minutes: date.getUTCMinutes()
        };
      });

      expect(result.year).toBe(2024);
      expect(result.month).toBe(0); // January is 0
      expect(result.date).toBe(1);
      expect(result.hours).toBe(14);
      expect(result.minutes).toBe(30);
    });
  });

});