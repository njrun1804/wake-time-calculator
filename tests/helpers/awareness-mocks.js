import { expect } from '@playwright/test';
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

const dailyResponse = JSON.parse(
  fs.readFileSync(fixturePath('api', 'forecast-daily-success.json'), 'utf-8')
);

const hourlyResponse = JSON.parse(
  fs.readFileSync(fixturePath('api', 'forecast-hourly-success.json'), 'utf-8')
);

export const awarenessFixtures = {
  dawnFixture,
  dailyResponse,
  hourlyResponse,
};

const mapDaily = (mapper) => {
  const { daily } = awarenessFixtures.dailyResponse;
  return daily.time.map((_, index) => mapper(index, daily.time.length, daily));
};

const createDailyPreset = (overrides) => {
  const result = {};

  const applyValue = (value) => {
    if (typeof value === 'function') {
      return mapDaily(value);
    }
    return mapDaily(() => value);
  };

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined) return;
    result[key] = applyValue(value);
  });

  // Ensure snowfall stays zero if not explicitly provided
  if (!('snowfall_sum' in result)) {
    result.snowfall_sum = mapDaily(() => 0);
  }

  return result;
};

const createHourlyPreset = (overrides) => {
  const { hourly } = awarenessFixtures.hourlyResponse;
  const fields = [
    'time',
    'temperature_2m',
    'relative_humidity_2m',
    'wind_speed_10m',
    'apparent_temperature',
    'precipitation_probability',
    'wet_bulb_temperature_2m',
    'weathercode',
    'snowfall',
  ];

  const result = {};
  fields.forEach((field) => {
    if (field === 'time') {
      result[field] = [overrides.time || hourly.time[0]];
      return;
    }
    if (field in overrides) {
      result[field] = [overrides[field]];
      return;
    }
    if (Array.isArray(hourly[field])) {
      result[field] = [...hourly[field]];
    }
  });

  return result;
};

export const awarenessStatePresets = {
  ok() {
    return {
      hourlyResponse: {
        hourly: createHourlyPreset({
          temperature_2m: 62,
          apparent_temperature: 61,
          relative_humidity_2m: 45,
          wind_speed_10m: 4,
          precipitation_probability: 5,
          wet_bulb_temperature_2m: 55,
          weathercode: 0,
          snowfall: 0,
        }),
      },
      dailyResponse: {
        daily: createDailyPreset({
          precipitation_sum: () => 0,
          precipitation_hours: () => 0,
          rain_sum: () => 0,
          temperature_2m_max: () => 65,
          temperature_2m_min: () => 48,
        }),
      },
    };
  },
  caution() {
    return {
      hourlyResponse: {
        hourly: createHourlyPreset({
          temperature_2m: 38,
          apparent_temperature: 32,
          relative_humidity_2m: 88,
          wind_speed_10m: 12,
          precipitation_probability: 55,
          wet_bulb_temperature_2m: 33,
          weathercode: 61,
          snowfall: 0,
        }),
      },
      dailyResponse: {
        daily: createDailyPreset({
          precipitation_sum: (index, length) =>
            index === length - 1
              ? 0.12
              : index === length - 2
                ? 0.08
                : 0.04,
          precipitation_hours: (index, length) =>
            index === length - 1
              ? 4
              : index === length - 2
                ? 3
                : 1,
          rain_sum: (index, length) =>
            index === length - 1
              ? 0.12
              : index === length - 2
                ? 0.08
                : 0.04,
          temperature_2m_max: (index, length) =>
            index === length - 1
              ? 36
              : index === length - 2
                ? 40
                : 45,
          temperature_2m_min: (index, length) =>
            index === length - 1
              ? 29
              : index === length - 2
                ? 33
                : 34,
        }),
      },
    };
  },
  avoid() {
    return {
      hourlyResponse: {
        hourly: createHourlyPreset({
          temperature_2m: 36,
          apparent_temperature: 33,
          relative_humidity_2m: 95,
          wind_speed_10m: 10,
          precipitation_probability: 80,
          wet_bulb_temperature_2m: 34,
          weathercode: 63,
          snowfall: 0,
        }),
      },
      dailyResponse: {
        daily: createDailyPreset({
          precipitation_sum: (index, length) =>
            index >= length - 2 ? (index === length - 1 ? 0.7 : 0.5) : 0.05,
          precipitation_hours: (index, length) =>
            index >= length - 2 ? 6 : 2,
          rain_sum: (index, length) =>
            index >= length - 2 ? (index === length - 1 ? 0.7 : 0.5) : 0.05,
          temperature_2m_max: (index, length) =>
            index >= length - 2 ? 55 : 45,
          temperature_2m_min: (index, length) =>
            index >= length - 2 ? 45 : 35,
        }),
      },
    };
  },
};

const deepClone = (value) =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const applyOverrides = (target, overrides) => {
  if (!isPlainObject(overrides)) return target;

  Object.entries(overrides).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      target[key] = value.map((entry) =>
        isPlainObject(entry)
          ? applyOverrides({}, entry)
          : Array.isArray(entry)
            ? [...entry]
            : entry
      );
      return;
    }

    if (isPlainObject(value)) {
      const base = isPlainObject(target[key]) ? { ...target[key] } : {};
      target[key] = applyOverrides(base, value);
      return;
    }

    target[key] = value;
  });

  return target;
};

const defaultSavedLocation = {
  lat: dailyResponse.latitude,
  lon: dailyResponse.longitude,
  city: 'Mocked Trailhead',
  tz: 'America/New_York',
};

const defaultGeoState = {
  mode: 'denied',
  coords: null,
  message: 'User denied Geolocation',
  reverse: {
    name: defaultSavedLocation.city,
    admin1: 'New Jersey',
    country: 'United States',
    country_code: 'US',
    latitude: defaultSavedLocation.lat,
    longitude: defaultSavedLocation.lon,
    timezone: defaultSavedLocation.tz,
  },
};

export async function setupAwarenessMocks(page, options = {}) {
  const saved = {
    ...defaultSavedLocation,
    ...(options.savedLocation || {}),
  };

  const geo = {
    ...defaultGeoState,
    ...(options.geolocation || {}),
  };

  const delays = {
    forecast: 0,
    ...(options.delays || {}),
  };

  const fixtures = applyOverrides(
    deepClone(awarenessFixtures),
    options.fixtureOverrides
  );

  await page.addInitScript(
    ({ savedLocation, geoState, fixtures, delays: delayConfig }) => {
      const state = {
        fixtures,
        geolocation: geoState,
        failures: {
          dawn: false,
          forecast: false,
          reverseGeocode: false,
        },
        delays: delayConfig,
      };

      window.__awarenessMock = state;
      window.__awarenessEvents = [];
      window.__onAwarenessEvent = null;

      localStorage.clear();
      localStorage.setItem('wake:weatherLat', String(savedLocation.lat));
      localStorage.setItem('wake:weatherLon', String(savedLocation.lon));
      localStorage.setItem('wake:weatherCity', savedLocation.city);
      localStorage.setItem('wake:weatherTz', savedLocation.tz);

      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition(success, error) {
            const geolocationState =
              window.__awarenessMock?.geolocation || state.geolocation;
            const { mode, coords, message } = geolocationState;
            state.lastGeoMode = mode;
            window.__awarenessMock.lastGeoMode = mode;
            state.geoCalls = state.geoCalls || [];
            state.geoCalls.push({ mode, timestamp: Date.now() });
            window.__awarenessMock.geoCalls = state.geoCalls;
            if (mode === 'success') {
              const positionCoords = coords || {
                latitude: savedLocation.lat,
                longitude: savedLocation.lon,
              };
              success({
                coords: {
                  latitude: positionCoords.latitude ?? positionCoords.lat,
                  longitude: positionCoords.longitude ?? positionCoords.lon,
                },
                timestamp: Date.now(),
              });
              return;
            }

            const errorMessage =
              message ||
              (mode === 'timeout'
                ? 'Location timeout'
                : 'User denied Geolocation');
            error({ code: 1, message: errorMessage });
          },
          watchPosition: () => 0,
          clearWatch: () => {},
        },
      });

      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url || '';

        if (url.includes('api.sunrisesunset.io')) {
          if (state.failures.dawn) {
            return new Response(null, { status: 500 });
          }
          return new Response(JSON.stringify(state.fixtures.dawnFixture), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const ensureDelay = async (key) => {
          const delay =
            window.__awarenessMock?.delays?.[key] ?? delayConfig?.[key] ?? 0;
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        };

        if (url.includes('api.open-meteo.com/v1/forecast')) {
          const params = new URL(url).searchParams;
          if (state.failures.forecast) {
            return new Response(null, { status: 500 });
          }
          if (params.get('daily')) {
            await ensureDelay('forecast');
            return new Response(JSON.stringify(state.fixtures.dailyResponse), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
          if (params.get('hourly')) {
            await ensureDelay('forecast');
            return new Response(JSON.stringify(state.fixtures.hourlyResponse), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

        if (url.includes('api.open-meteo.com/v1/reverse')) {
          if (state.failures.reverseGeocode) {
            return new Response(null, { status: 500 });
          }

          const geolocationState =
            window.__awarenessMock?.geolocation || state.geolocation;
          const reverse = geolocationState.reverse || defaultGeoState.reverse;
          const result = Array.isArray(reverse) ? reverse : [reverse];

          return new Response(JSON.stringify({ results: result }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (url.includes('nominatim.openstreetmap.org')) {
          return new Response(JSON.stringify({}), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return originalFetch(input, init);
      };

    },
    {
      savedLocation: saved,
      geoState: {
        ...geo,
        reverse: geo.reverse || defaultGeoState.reverse,
      },
      fixtures,
      delays,
    }
  );
}

export async function setMockGeolocation(page, geolocation) {
  await page.evaluate((geo) => {
    if (!window.__awarenessMock) return;
    window.__awarenessMock.geolocation = {
      ...window.__awarenessMock.geolocation,
      ...geo,
      reverse: geo.reverse
        ? geo.reverse
        : window.__awarenessMock.geolocation.reverse,
    };
  }, geolocation);
}

export async function setMockApiFailures(page, overrides) {
  await page.evaluate((failures) => {
    if (!window.__awarenessMock) return;
    window.__awarenessMock.failures = {
      ...window.__awarenessMock.failures,
      ...failures,
    };
  }, overrides);
}

export async function resetAwarenessEvents(page) {
  await page.evaluate(() => {
    if (window.__awarenessEvents) {
      window.__awarenessEvents.length = 0;
    } else {
      window.__awarenessEvents = [];
    }
  });
}

export async function waitForAwarenessEvent(
  page,
  type,
  predicate = () => true,
  options = {}
) {
  let match = null;
  await expect
    .poll(
      async () => {
        const events = await page.evaluate(
          () => window.__awarenessEvents || []
        );
        for (let i = events.length - 1; i >= 0; i -= 1) {
          const event = events[i];
          if (event.type === type && predicate(event.detail, event)) {
            match = event;
            return true;
          }
        }
        return false;
      },
      {
        timeout: options.timeout ?? 20000,
        message:
          options.message ||
          `Expected awareness event "${type}" to occur within timeout`,
      }
    )
    .toBeTruthy();
  return match;
}

export async function triggerAwareness(page) {
  // Directly initialize awareness module
  await page.evaluate(async () => {
    // Import and initialize awareness directly
    const module = await import('./js/app/awareness/index.js');
    await module.initializeAwareness();
  });

  // Wait for awareness to be ready
  await waitForAwarenessEvent(page, 'ready', undefined, { timeout: 10000 });
}

export async function getLatestAwarenessEvent(page, type) {
  return page.evaluate((eventType) => {
    const events = window.__awarenessEvents || [];
    for (let i = events.length - 1; i >= 0; i -= 1) {
      if (events[i].type === eventType) {
        return events[i];
      }
    }
    return null;
  }, type);
}
