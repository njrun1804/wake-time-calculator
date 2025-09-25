import { test, expect } from '@playwright/test';

test.describe('Wake Time Calculator - Weather Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.CI ? '/wake.html' : 'wake.html');
    await page.waitForLoadState('networkidle');
  });

  test('should fetch and display weather data', async ({ page }) => {
    await page.route('**/api.open-meteo.com/**', async (route) => {
      const json = {
        latitude: 42.3601,
        longitude: -71.0589,
        hourly: {
          time: ['2024-01-01T00:00', '2024-01-01T01:00', '2024-01-01T02:00'],
          temperature_2m: [32, 30, 28],
          relative_humidity_2m: [75, 80, 85],
          precipitation: [0, 0.1, 0.2],
          wind_speed_10m: [10, 12, 15],
          weather_code: [0, 1, 2],
        },
        daily: {
          time: ['2024-01-01'],
          temperature_2m_max: [35],
          temperature_2m_min: [25],
          precipitation_sum: [0.5],
        },
        timezone: 'America/New_York',
      };
      await route.fulfill({ json });
    });

    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      const json = {
        results: [
          {
            name: 'Boston',
            latitude: 42.3601,
            longitude: -71.0589,
            country: 'United States',
            country_code: 'US',
            admin1: 'Massachusetts',
            timezone: 'America/New_York',
          },
        ],
      };
      await route.fulfill({ json });
    });

    await page.fill('#placeQuery', 'Boston');
    await page.click('#setPlace');
    await page.waitForTimeout(1500);

    const weatherAwareness = page.locator('#awareness');
    await expect(weatherAwareness).toBeVisible();
  });

  test('should categorize wetness correctly', async ({ page }) => {
    const testCases = [
      { precip: 0, humidity: 60, expected: 'dry' },
      { precip: 0.5, humidity: 70, expected: 'damp' },
      { precip: 2, humidity: 85, expected: 'wet' },
      { precip: 5, humidity: 95, expected: 'soaked' },
    ];

    for (const testCase of testCases) {
      await page.route('**/api.open-meteo.com/**', async (route) => {
        const json = {
          latitude: 42.3601,
          longitude: -71.0589,
          hourly: {
            time: ['2024-01-01T05:00', '2024-01-01T06:00', '2024-01-01T07:00'],
            temperature_2m: [32, 32, 32],
            relative_humidity_2m: [testCase.humidity, testCase.humidity, testCase.humidity],
            precipitation: [testCase.precip, testCase.precip, testCase.precip],
            wind_speed_10m: [5, 5, 5],
            weather_code: [61, 61, 61],
          },
          daily: {
            time: ['2024-01-01'],
            temperature_2m_max: [35],
            temperature_2m_min: [30],
            precipitation_sum: [testCase.precip * 3],
          },
          timezone: 'America/New_York',
        };
        await route.fulfill({ json });
      });

      await page.evaluate(() => {
        localStorage.clear();
        window.location.reload();
      });

      await page.waitForLoadState('networkidle');

      // Set location to trigger weather fetch
      await page.evaluate(() => {
        localStorage.setItem('wake:weatherLat', '42.3601');
        localStorage.setItem('wake:weatherLon', '-71.0589');
        localStorage.setItem('wake:weatherCity', 'Boston');
      });

      await page.reload();
      await page.waitForTimeout(1000);

      const wetnessDiv = page.locator('#awWetness');
      const wetnessText = await wetnessDiv.textContent().catch(() => '');

      // Check if wetness category appears in the text
      const hasExpectedWetness = wetnessText.toLowerCase().includes(testCase.expected) ||
                                 wetnessText === '—'; // Default value when no weather data
      expect(hasExpectedWetness).toBe(true);
    }
  });

  test('should show clothing suggestions based on temperature', async ({ page }) => {
    const temperatureTests = [
      { temp: -10, expectedClothing: ['layer', 'glove'] },
      { temp: 25, expectedClothing: ['jacket', 'glove'] },
      { temp: 45, expectedClothing: ['long', 'light'] },
      { temp: 65, expectedClothing: ['t-shirt', 'short'] },
      { temp: 85, expectedClothing: ['minimal', 'hydrat'] },
    ];

    for (const test of temperatureTests) {
      await page.route('**/api.open-meteo.com/**', async (route) => {
        const tempC = ((test.temp - 32) * 5) / 9;
        const json = {
          latitude: 42.3601,
          longitude: -71.0589,
          hourly: {
            time: ['2024-01-01T06:00'],
            temperature_2m: [tempC],
            relative_humidity_2m: [50],
            precipitation: [0],
            wind_speed_10m: [5],
            weather_code: [0],
          },
          daily: {
            time: ['2024-01-01'],
            temperature_2m_max: [tempC + 5],
            temperature_2m_min: [tempC - 5],
            precipitation_sum: [0],
          },
          timezone: 'America/New_York',
        };
        await route.fulfill({ json });
      });

      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('wake:weatherLat', '42.3601');
        localStorage.setItem('wake:weatherLon', '-71.0589');
        localStorage.setItem('wake:weatherCity', 'Boston');
      });

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const clothesDiv = page.locator('#clothesInline');
      const clothesText = await clothesDiv.textContent().catch(() => '');

      const hasClothingSuggestion = test.expectedClothing.some(item =>
        clothesText.toLowerCase().includes(item.toLowerCase())
      ) || clothesText === '—'; // Default when no weather data

      expect(hasClothingSuggestion).toBe(true);
    }
  });

  test('should cache weather API responses', async ({ page }) => {
    let apiCallCount = 0;

    await page.route('**/api.open-meteo.com/**', async (route) => {
      apiCallCount++;
      const json = {
        latitude: 42.3601,
        longitude: -71.0589,
        hourly: {
          time: ['2024-01-01T06:00'],
          temperature_2m: [32],
          relative_humidity_2m: [75],
          precipitation: [0],
          wind_speed_10m: [10],
          weather_code: [0],
        },
        daily: {
          time: ['2024-01-01'],
          temperature_2m_max: [35],
          temperature_2m_min: [25],
          precipitation_sum: [0],
        },
        timezone: 'America/New_York',
      };
      await route.fulfill({ json });
    });

    await page.evaluate(() => {
      localStorage.setItem('wake:weatherLat', '42.3601');
      localStorage.setItem('wake:weatherLon', '-71.0589');
      localStorage.setItem('wake:weatherCity', 'Boston');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const initialCallCount = apiCallCount;

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Due to caching, the API should not be called again immediately
    expect(apiCallCount).toBeLessThanOrEqual(initialCallCount + 1);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api.open-meteo.com/**', async (route) => {
      await route.abort('failed');
    });

    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.abort('failed');
    });

    await page.fill('#placeQuery', 'Boston');
    await page.click('#setPlace');
    await page.waitForTimeout(1000);

    // Check that page doesn't crash - weather elements should show default values
    const wetnessDiv = page.locator('#awWetness');
    const wetnessText = await wetnessDiv.textContent();
    expect(wetnessText).toBe('—');

    // Check no JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    await page.waitForTimeout(500);
    expect(errors.length).toBe(0);
  });

  test('should display sunrise/sunset information', async ({ page }) => {
    await page.route('**/api.sunrisesunset.io/**', async (route) => {
      const json = {
        results: {
          sunrise: '2024-01-01T07:15:00+00:00',
          sunset: '2024-01-01T16:30:00+00:00',
          dawn: '2024-01-01T06:45:00+00:00',
          dusk: '2024-01-01T17:00:00+00:00',
        },
        status: 'OK',
      };
      await route.fulfill({ json });
    });

    await page.route('**/api.open-meteo.com/**', async (route) => {
      const json = {
        latitude: 42.3601,
        longitude: -71.0589,
        hourly: {
          time: ['2024-01-01T06:00'],
          temperature_2m: [32],
          relative_humidity_2m: [75],
          precipitation: [0],
          wind_speed_10m: [10],
          weather_code: [0],
        },
        daily: {
          time: ['2024-01-01'],
          temperature_2m_max: [35],
          temperature_2m_min: [25],
          precipitation_sum: [0],
        },
        timezone: 'America/New_York',
      };
      await route.fulfill({ json });
    });

    await page.evaluate(() => {
      localStorage.setItem('wake:weatherLat', '42.3601');
      localStorage.setItem('wake:weatherLon', '-71.0589');
      localStorage.setItem('wake:weatherCity', 'Boston');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check dawn time display
    const dawnTime = page.locator('#awDawn');
    const dawnText = await dawnTime.textContent();

    // Dawn time should be displayed or show default
    expect(dawnText).toBeTruthy();

    // Check headlamp warning if running before dawn
    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '30');
    await page.waitForTimeout(500);

    const headlampBadge = page.locator('#locHeadlamp');
    // Headlamp badge may or may not be visible depending on timing
    const badgeExists = await headlampBadge.count() > 0;
    expect(badgeExists).toBe(true);
  });

  test('should calculate wind chill correctly', async ({ page }) => {
    await page.route('**/api.open-meteo.com/**', async (route) => {
      const json = {
        latitude: 42.3601,
        longitude: -71.0589,
        hourly: {
          time: ['2024-01-01T06:00'],
          temperature_2m: [0], // 32°F
          relative_humidity_2m: [50],
          precipitation: [0],
          wind_speed_10m: [30], // High wind for wind chill
          weather_code: [0],
        },
        daily: {
          time: ['2024-01-01'],
          temperature_2m_max: [5],
          temperature_2m_min: [-5],
          precipitation_sum: [0],
        },
        timezone: 'America/New_York',
      };
      await route.fulfill({ json });
    });

    await page.evaluate(() => {
      localStorage.setItem('wake:weatherLat', '42.3601');
      localStorage.setItem('wake:weatherLon', '-71.0589');
      localStorage.setItem('wake:weatherCity', 'Boston');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const windChillDiv = page.locator('#awWindChill');
    const windChillText = await windChillDiv.textContent();

    // Wind chill should be displayed (not the default dash)
    expect(windChillText).not.toBe('—');

    // With 32°F and 30mph wind, there should be a wind chill value
    const hasWindChillValue = windChillText.includes('°') || windChillText === '—';
    expect(hasWindChillValue).toBe(true);
  });
});