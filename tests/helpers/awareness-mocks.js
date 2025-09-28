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

  await page.addInitScript(
    ({ savedLocation, geoState, fixtures }) => {
      const state = {
        fixtures,
        geolocation: geoState,
        failures: {
          dawn: false,
          forecast: false,
          reverseGeocode: false,
        },
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

        if (url.includes('api.open-meteo.com/v1/forecast')) {
          const params = new URL(url).searchParams;
          if (state.failures.forecast) {
            return new Response(null, { status: 500 });
          }
          if (params.get('daily')) {
            return new Response(JSON.stringify(state.fixtures.dailyResponse), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
          if (params.get('hourly')) {
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
      fixtures: awarenessFixtures,
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
  await expect
    .poll(() =>
      page.evaluate(
        () => typeof window.__triggerAwarenessForTests === 'function'
      )
    )
    .toBe(true);

  try {
    await page.evaluate(async () => {
      await window.__triggerAwarenessForTests();
    });
  } catch (error) {
    console.error('[Test Helper] triggerAwareness failed:', error);
    // Log any console errors from the page
    const consoleErrors = await page.evaluate(() => {
      return window.__consoleErrors || [];
    });
    if (consoleErrors.length > 0) {
      console.error('[Page Console Errors]:', consoleErrors);
    }
    throw error;
  }

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
