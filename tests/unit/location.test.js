import test from 'node:test';
import assert from 'node:assert/strict';

import {
  geocodePlace,
  reverseGeocode,
  getCurrentLocation,
  validateCoordinates,
} from '../../js/modules/location.js';
import {
  expectRejectsWithMessage,
  withPatchedGlobal,
} from './helpers/environment.js';

test('location: validateCoordinates recognises valid and invalid pairs', () => {
  assert.strictEqual(validateCoordinates(40.7128, -74.006), true);
  assert.strictEqual(validateCoordinates(90, 180), true);
  assert.strictEqual(validateCoordinates(0, 0), true);

  assert.strictEqual(validateCoordinates(91, 0), false);
  assert.strictEqual(validateCoordinates(-91, 0), false);
  assert.strictEqual(validateCoordinates(0, 181), false);
  assert.strictEqual(validateCoordinates(0, -181), false);
  assert.strictEqual(validateCoordinates(Number.NaN, 0), false);
  assert.strictEqual(validateCoordinates(Infinity, 0), false);
  assert.strictEqual(validateCoordinates('40.7', '-74.0'), false);
  assert.strictEqual(validateCoordinates(null, undefined), false);
});

test('location: getCurrentLocation rejects when geolocation is unavailable', async () => {
  await withPatchedGlobal('navigator', {}, async () => {
    await expectRejectsWithMessage(() => getCurrentLocation(), 'Geolocation not supported');
  });
});

test('location: getCurrentLocation propagates permission errors', async () => {
  const mockNavigator = {
    geolocation: {
      getCurrentPosition: (_success, error) => {
        setTimeout(() => {
          error({
            code: 1,
            message: 'User denied the request for Geolocation.',
          });
        }, 10);
      },
    },
  };

  await withPatchedGlobal('navigator', mockNavigator, async () => {
    await expectRejectsWithMessage(() => getCurrentLocation(), 'Location access denied');
  });
});

test('location: getCurrentLocation resolves with coordinates', async () => {
  const mockNavigator = {
    geolocation: {
      getCurrentPosition: (success) => {
        setTimeout(() => {
          success({
            coords: { latitude: 40.7128, longitude: -74.006 },
          });
        }, 10);
      },
    },
  };

  await withPatchedGlobal('navigator', mockNavigator, async () => {
    const location = await getCurrentLocation();
    assert.deepStrictEqual(location, { lat: 40.7128, lon: -74.006 });
  });
});

test('location: reverseGeocode falls back when APIs fail', async () => {
  const failingFetch = () => Promise.reject(new Error('Network error'));

  await withPatchedGlobal('fetch', failingFetch, async () => {
    const location = await reverseGeocode(40.7128, -74.006);
    assert.strictEqual(location.city, '40.7128, -74.0060');
  });
});

test('location: geocodePlace throws on HTTP error', async () => {
  const fetchFailure = () =>
    Promise.resolve({
      ok: false,
      status: 404,
    });

  await withPatchedGlobal('fetch', fetchFailure, async () => {
    await expectRejectsWithMessage(() => geocodePlace('Nowhere'), 'geocoding failed');
  });
});

test('location: geocodePlace throws when no results returned', async () => {
  const fetchNoResults = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });

  await withPatchedGlobal('fetch', fetchNoResults, async () => {
    await expectRejectsWithMessage(() => geocodePlace('Empty'), 'no results');
  });
});

test('location: geocodePlace returns parsed data', async () => {
  const fetchSuccess = () =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              latitude: 40.7128,
              longitude: -74.006,
              timezone: 'America/New_York',
              name: 'New York',
            },
          ],
        }),
    });

  await withPatchedGlobal('fetch', fetchSuccess, async () => {
    const location = await geocodePlace('New York');
    assert.deepStrictEqual(location, {
      lat: 40.7128,
      lon: -74.006,
      city: 'New York',
      tz: 'America/New_York',
    });
  });
});

test('location: reverseGeocode returns Open-Meteo result when available', async () => {
  const fetchSequence = async (url) => {
    if (url.startsWith('https://geocoding-api.open-meteo.com')) {
      return {
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                name: 'Hoboken',
                timezone: 'America/New_York',
              },
            ],
          }),
      };
    }
    throw new Error('Unexpected URL');
  };

  await withPatchedGlobal('fetch', fetchSequence, async () => {
    const location = await reverseGeocode(40.75, -74.03);
    assert.deepStrictEqual(location, {
      city: 'Hoboken',
      tz: 'America/New_York',
    });
  });
});
