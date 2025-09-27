import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturePath = (...segments) =>
  path.resolve(__dirname, '..', 'fixtures', ...segments);

const dawnFixture = JSON.parse(
  fs.readFileSync(fixturePath('api', 'sunrise-success.json'), 'utf-8')
);

const DAWN_ISO = '2025-03-18';
const HOURLY_TIME = `${DAWN_ISO}T06:00`;

const dailyResponse = {
  latitude: 40.3501,
  longitude: -74.0671,
  generationtime_ms: 0.1,
  utc_offset_seconds: -14400,
  timezone: 'America/New_York',
  timezone_abbreviation: 'EDT',
  elevation: 20,
  daily_units: {
    time: 'iso8601',
    precipitation_sum: 'inch',
    precipitation_hours: 'hours',
    rain_sum: 'inch',
    snowfall_sum: 'inch',
    et0_fao_evapotranspiration: 'inch',
    temperature_2m_max: '°F',
    temperature_2m_min: '°F',
  },
  daily: {
    time: [
      '2025-03-11',
      '2025-03-12',
      '2025-03-13',
      '2025-03-14',
      '2025-03-15',
      '2025-03-16',
      '2025-03-17',
    ],
    precipitation_sum: [0.0, 0.05, 0.12, 0.0, 0.0, 0.18, 0.22],
    precipitation_hours: [0, 2, 4, 0, 0, 3, 5],
    rain_sum: [0.0, 0.05, 0.12, 0.0, 0.0, 0.18, 0.22],
    snowfall_sum: [0, 0, 0, 0, 0, 0, 0],
    et0_fao_evapotranspiration: [0.1, 0.11, 0.12, 0.13, 0.14, 0.12, 0.12],
    temperature_2m_max: [52, 50, 48, 45, 42, 38, 38],
    temperature_2m_min: [40, 38, 36, 34, 33, 31, 28],
  },
};

const hourlyResponse = {
  latitude: 40.3501,
  longitude: -74.0671,
  generationtime_ms: 0.1,
  utc_offset_seconds: -14400,
  timezone: 'America/New_York',
  timezone_abbreviation: 'EDT',
  elevation: 20,
  hourly_units: {
    time: 'iso8601',
    temperature_2m: '°F',
    relative_humidity_2m: '%',
    wind_speed_10m: 'mph',
    apparent_temperature: '°F',
    precipitation_probability: '%',
    wet_bulb_temperature_2m: '°F',
    weathercode: 'wmo code',
    snowfall: 'inch',
  },
  hourly: {
    time: [HOURLY_TIME],
    temperature_2m: [35],
    relative_humidity_2m: [92],
    wind_speed_10m: [8],
    apparent_temperature: [33],
    precipitation_probability: [55],
    wet_bulb_temperature_2m: [34],
    weathercode: [61],
    snowfall: [0],
  },
};

async function setupMockedWeather(page) {
  await page.addInitScript(
    ({ saved }) => {
      localStorage.clear();
      localStorage.setItem('wake:weatherLat', String(saved.lat));
      localStorage.setItem('wake:weatherLon', String(saved.lon));
      localStorage.setItem('wake:weatherCity', saved.city);
      localStorage.setItem('wake:weatherTz', saved.tz);

      // Force requestIdleCallback to be available and run immediately
      if (!window.requestIdleCallback) {
        window.requestIdleCallback = (cb) => setTimeout(cb, 0);
      }
    },
    {
      saved: {
        lat: dailyResponse.latitude,
        lon: dailyResponse.longitude,
        city: 'Mocked Trailhead',
        tz: 'America/New_York',
      },
    }
  );

  await page.route('**/api.sunrisesunset.io/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(dawnFixture),
    });
  });

  await page.route('**/api.open-meteo.com/v1/forecast?**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('daily')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dailyResponse),
      });
      return;
    }
    if (url.searchParams.get('hourly')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hourlyResponse),
      });
      return;
    }
    await route.fallback();
  });
}

test.describe('Weather awareness with mocked data', () => {
  test.skip('surfaces slick icy caution when wetness heuristics trigger freeze-thaw @full', async ({
    page,
  }) => {
    await setupMockedWeather(page);
    await page.goto('/index.html');

    // Wait for content to load - the text should change from default "—"
    const decision = page.locator('#awDecisionText');
    await page.waitForFunction(
      () => {
        const el = document.getElementById('awDecisionText');
        return el && el.textContent !== '—';
      },
      { timeout: 15000 }
    );

    await expect(decision).toHaveText('Slick/Icy');
    await expect(page.locator('#awMsg')).toBeHidden();
    await expect(page.locator('#awWetness')).toHaveAttribute('title', /0.22\"/);
  });

  test.skip('reports location denied when geolocation access fails @full', async ({
    page,
  }) => {
    await setupMockedWeather(page);
    await page.addInitScript(() => {
      const denied = {
        getCurrentPosition: (_success, error) => {
          setTimeout(() => {
            error({ code: 1, message: 'User denied Geolocation' });
          }, 0);
        },
      };
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: denied,
      });
    });

    await page.goto('/index.html');

    // Wait for content to load - the text should change from default "—"
    const decision = page.locator('#awDecisionText');
    await page.waitForFunction(
      () => {
        const el = document.getElementById('awDecisionText');
        return el && el.textContent !== '—';
      },
      { timeout: 15000 }
    );

    await expect(decision).toHaveText('Slick/Icy');

    await page.getByRole('button', { name: 'Use my location' }).click();

    await expect(page.locator('#awMsg')).toHaveText('Location denied.');
    await expect(decision).toHaveText('—');
  });
});
