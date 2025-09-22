import { test, expect } from '@playwright/test';

test.describe('Weather Module - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');
  });

  test.describe('categorizeWetness', () => {
    test('returns "Dry" for null or undefined data', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { categorizeWetness } = await import('./js/modules/weather.js');

        return {
          nullData: categorizeWetness(null),
          undefinedData: categorizeWetness(undefined),
          emptyObject: categorizeWetness({}),
          falseIsWet: categorizeWetness({ isWet: false })
        };
      });

      expect(results.nullData).toBe('Dry');
      expect(results.undefinedData).toBe('Dry');
      expect(results.emptyObject).toBe('Dry');
      expect(results.falseIsWet).toBe('Dry');
    });

    test('categorizes wetness levels correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { categorizeWetness } = await import('./js/modules/weather.js');

        return {
          veryWet: categorizeWetness({ isWet: true, wetDays: 5, avgPrecip: 0.3 }),
          wet1: categorizeWetness({ isWet: true, wetDays: 3, avgPrecip: 0.2 }),
          wet2: categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.6 }),
          slightlyWet: categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.3 }),
          edgeCase: categorizeWetness({ isWet: true, wetDays: 2, avgPrecip: 0.5 })
        };
      });

      expect(results.veryWet).toBe('Very Wet');
      expect(results.wet1).toBe('Wet'); // wetDays >= 2
      expect(results.wet2).toBe('Wet'); // avgPrecip > 0.5
      expect(results.slightlyWet).toBe('Slightly Wet');
      expect(results.edgeCase).toBe('Wet'); // wetDays >= 2
    });

    test('handles edge cases and boundary conditions', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { categorizeWetness } = await import('./js/modules/weather.js');

        return {
          exactlyFourDays: categorizeWetness({ isWet: true, wetDays: 4, avgPrecip: 0.1 }),
          exactlyTwoDays: categorizeWetness({ isWet: true, wetDays: 2, avgPrecip: 0.1 }),
          exactlyHalfPrecip: categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.5 }),
          justOverHalfPrecip: categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.51 })
        };
      });

      expect(results.exactlyFourDays).toBe('Very Wet');
      expect(results.exactlyTwoDays).toBe('Wet');
      expect(results.exactlyHalfPrecip).toBe('Slightly Wet'); // Not greater than 0.5
      expect(results.justOverHalfPrecip).toBe('Wet'); // Greater than 0.5
    });
  });

  test.describe('formatTemp', () => {
    test('formats temperature correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { formatTemp } = await import('./js/modules/weather.js');

        return {
          positive: formatTemp(75.6),
          negative: formatTemp(-10.2),
          zero: formatTemp(0),
          freezing: formatTemp(32),
          hot: formatTemp(98.6),
          decimal: formatTemp(72.4),
          null: formatTemp(null),
          undefined: formatTemp(undefined),
          string: formatTemp('75'),
          nan: formatTemp(NaN)
        };
      });

      expect(results.positive).toBe('76°F');
      expect(results.negative).toBe('-10°F');
      expect(results.zero).toBe('0°F');
      expect(results.freezing).toBe('32°F');
      expect(results.hot).toBe('99°F');
      expect(results.decimal).toBe('72°F');
      expect(results.null).toBe('—');
      expect(results.undefined).toBe('—');
      expect(results.string).toBe('—');
      expect(results.nan).toBe('—');
    });
  });

  test.describe('formatWind', () => {
    test('formats wind speed correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { formatWind } = await import('./js/modules/weather.js');

        return {
          calm: formatWind(0),
          light: formatWind(5.4),
          moderate: formatWind(15.8),
          strong: formatWind(25.6),
          decimal: formatWind(12.3),
          null: formatWind(null),
          undefined: formatWind(undefined),
          string: formatWind('15'),
          nan: formatWind(NaN)
        };
      });

      expect(results.calm).toBe('0 mph');
      expect(results.light).toBe('5 mph');
      expect(results.moderate).toBe('16 mph');
      expect(results.strong).toBe('26 mph');
      expect(results.decimal).toBe('12 mph');
      expect(results.null).toBe('—');
      expect(results.undefined).toBe('—');
      expect(results.string).toBe('—');
      expect(results.nan).toBe('—');
    });
  });

  test.describe('formatPoP', () => {
    test('formats probability of precipitation correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { formatPoP } = await import('./js/modules/weather.js');

        return {
          zero: formatPoP(0),
          low: formatPoP(15.2),
          medium: formatPoP(50),
          high: formatPoP(85.7),
          hundred: formatPoP(100),
          decimal: formatPoP(33.6),
          null: formatPoP(null),
          undefined: formatPoP(undefined),
          string: formatPoP('50'),
          nan: formatPoP(NaN)
        };
      });

      expect(results.zero).toBe('0%');
      expect(results.low).toBe('15%');
      expect(results.medium).toBe('50%');
      expect(results.high).toBe('86%');
      expect(results.hundred).toBe('100%');
      expect(results.decimal).toBe('34%');
      expect(results.null).toBe('—');
      expect(results.undefined).toBe('—');
      expect(results.string).toBe('—');
      expect(results.nan).toBe('—');
    });
  });

  test.describe('fetchWeatherAround error handling', () => {
    test('handles network errors gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fetchWeatherAround } = await import('./js/modules/weather.js');

        // Mock fetch to fail
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error('Network error'));

        try {
          await fetchWeatherAround(40.7128, -74.0060, new Date(), 'America/New_York');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('handles API errors gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fetchWeatherAround } = await import('./js/modules/weather.js');

        // Mock fetch to return error response
        const originalFetch = window.fetch;
        window.fetch = () => Promise.resolve({
          ok: false,
          status: 500
        });

        try {
          await fetchWeatherAround(40.7128, -74.0060, new Date(), 'America/New_York');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('weather fetch failed');
    });
  });

  test.describe('fetchWetnessInputs error handling', () => {
    test('handles network errors gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fetchWetnessInputs } = await import('./js/modules/weather.js');

        // Mock fetch to fail
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error('Connection timeout'));

        try {
          await fetchWetnessInputs(40.7128, -74.0060, new Date(), 'America/New_York');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    test('returns default values when no data available', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { fetchWetnessInputs } = await import('./js/modules/weather.js');

        // Mock fetch to return success but no daily data
        const originalFetch = window.fetch;
        window.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hourly: {} }) // No daily data
        });

        try {
          const wetness = await fetchWetnessInputs(40.7128, -74.0060, new Date(), 'America/New_York');
          return { success: true, wetness, error: null };
        } catch (error) {
          return { success: false, wetness: null, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(true);
      expect(result.wetness.isWet).toBe(false);
      expect(result.wetness.wetDays).toBe(0);
    });
  });

  test.describe('module integration', () => {
    test('works with constants from core module', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Test that weather module can import from constants
        const { formatTemp, formatWind, formatPoP } = await import('./js/modules/weather.js');

        return {
          tempFormatted: formatTemp(72),
          windFormatted: formatWind(10),
          popFormatted: formatPoP(30)
        };
      });

      expect(result.tempFormatted).toBe('72°F');
      expect(result.windFormatted).toBe('10 mph');
      expect(result.popFormatted).toBe('30%');
    });
  });
});