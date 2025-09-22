import { test, expect } from '@playwright/test';

test.describe('Storage Module - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page that loads the modules
    await page.goto('/index-modular.html');

    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('save and load', () => {
    test('saves and loads string values', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        Storage.save('test:key', 'value');
        return Storage.load('test:key');
      });
      expect(result).toBe('value');
    });

    test('saves and loads numeric values as strings', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        Storage.save('test:number', 123);
        return Storage.load('test:number');
      });
      expect(result).toBe('123');
    });

    test('returns default value when key not found', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        return Storage.load('nonexistent', 'default');
      });
      expect(result).toBe('default');
    });

    test('returns null when key not found and no default', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        return Storage.load('nonexistent');
      });
      expect(result).toBe(null);
    });
  });

  test.describe('saveFormValues and loadFormValues', () => {
    test('saves and loads form values correctly', async ({ page }) => {
      const loaded = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        const values = {
          firstMeeting: '09:00',
          run: 45,
          travel: 20,
          breakfast: 15,
          location: 'park'
        };
        Storage.saveFormValues(values);
        return Storage.loadFormValues();
      });

      expect(loaded.firstMeeting).toBe('09:00');
      expect(loaded.run).toBe('45');
      expect(loaded.travel).toBe('20');
      expect(loaded.breakfast).toBe('15');
      expect(loaded.location).toBe('park');
    });

    test('loads defaults for missing values', async ({ page }) => {
      const loaded = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        return Storage.loadFormValues();
      });

      expect(loaded.firstMeeting).toBe('08:30'); // default
      expect(loaded.run).toBe('0'); // default
      expect(loaded.travel).toBe('0'); // default
      expect(loaded.breakfast).toBe('0'); // default
      expect(loaded.location).toBe('round-town'); // default
    });
  });

  test.describe('weather location', () => {
    test('saves and loads weather location', async ({ page }) => {
      const loaded = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        const location = {
          lat: 42.3601,
          lon: -71.0589,
          city: 'Boston',
          tz: 'America/New_York'
        };
        Storage.saveWeatherLocation(location);
        return Storage.loadWeatherLocation();
      });

      expect(loaded.lat).toBe(42.3601);
      expect(loaded.lon).toBe(-71.0589);
      expect(loaded.city).toBe('Boston');
      expect(loaded.tz).toBe('America/New_York');
    });

    test('returns null for invalid location', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        Storage.saveWeatherLocation({ lat: 'invalid', lon: 'invalid' });
        return Storage.loadWeatherLocation();
      });
      expect(result).toBe(null);
    });
  });

  test.describe('cache', () => {
    test('saves and loads cached data', async ({ page }) => {
      const loaded = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        const data = { weather: 'sunny', temp: 72 };
        Storage.saveCache('test:cache', data);
        return Storage.loadCache('test:cache', 60000);
      });
      expect(loaded).toEqual({ weather: 'sunny', temp: 72 });
    });

    test('returns null for expired cache', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        const data = { weather: 'cloudy' };
        Storage.saveCache('test:cache', data);

        // Simulate expired cache
        localStorage.setItem('test:cache:t', String(Date.now() - 100000));

        return Storage.loadCache('test:cache', 60000);
      });
      expect(result).toBe(null);
    });

    test('returns null for missing cache', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');
        return Storage.loadCache('missing:cache', 60000);
      });
      expect(result).toBe(null);
    });
  });

  test.describe('clear', () => {
    test('clears all stored data', async ({ page }) => {
      const { formValues, weatherLocation } = await page.evaluate(async () => {
        const { Storage } = await import('./js/core/storage.js');

        Storage.saveFormValues({
          firstMeeting: '10:00',
          run: 30
        });
        Storage.saveWeatherLocation({
          lat: 40.7128,
          lon: -74.0060
        });

        Storage.clear();

        return {
          formValues: Storage.loadFormValues(),
          weatherLocation: Storage.loadWeatherLocation()
        };
      });

      // Should return defaults after clear
      expect(formValues.firstMeeting).toBe('08:30');
      expect(weatherLocation).toBe(null);
    });
  });
});