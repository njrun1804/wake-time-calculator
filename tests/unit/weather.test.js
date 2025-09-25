import test from 'node:test';
import assert from 'node:assert/strict';

import {
  categorizeWetness,
  formatTemp,
  formatWind,
  formatPoP,
  fetchWeatherAround,
  fetchWetnessInputs,
} from '../../js/modules/weather.js';
import {
  expectRejectsWithMessage,
  withPatchedGlobal,
} from './helpers/environment.js';

test('weather: categorizeWetness handles nullish inputs', () => {
  assert.strictEqual(categorizeWetness(null), 'Dry');
  assert.strictEqual(categorizeWetness(undefined), 'Dry');
  assert.strictEqual(categorizeWetness({}), 'Dry');
  assert.strictEqual(categorizeWetness({ isWet: false }), 'Dry');
});

test('weather: categorizeWetness maps wetness levels', () => {
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 5, avgPrecip: 0.3 }),
    'Very Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 3, avgPrecip: 0.2 }),
    'Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.6 }),
    'Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.3 }),
    'Slightly Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 2, avgPrecip: 0.5 }),
    'Wet',
  );
});

test('weather: categorizeWetness honours boundary conditions', () => {
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 4, avgPrecip: 0.1 }),
    'Very Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 2, avgPrecip: 0.1 }),
    'Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.5 }),
    'Slightly Wet',
  );
  assert.strictEqual(
    categorizeWetness({ isWet: true, wetDays: 1, avgPrecip: 0.51 }),
    'Wet',
  );
});

test('weather: formatTemp handles temperature formatting', () => {
  assert.strictEqual(formatTemp(75.6), '76°F');
  assert.strictEqual(formatTemp(-10.2), '-10°F');
  assert.strictEqual(formatTemp(0), '0°F');
  assert.strictEqual(formatTemp(32), '32°F');
  assert.strictEqual(formatTemp(98.6), '99°F');
  assert.strictEqual(formatTemp(72.4), '72°F');
  assert.strictEqual(formatTemp(null), '—');
  assert.strictEqual(formatTemp(undefined), '—');
  assert.strictEqual(formatTemp('75'), '—');
  assert.strictEqual(formatTemp(Number.NaN), '—');
});

test('weather: formatWind handles wind formatting', () => {
  assert.strictEqual(formatWind(0), '0 mph');
  assert.strictEqual(formatWind(5.4), '5 mph');
  assert.strictEqual(formatWind(15.8), '16 mph');
  assert.strictEqual(formatWind(25.6), '26 mph');
  assert.strictEqual(formatWind(12.3), '12 mph');
  assert.strictEqual(formatWind(null), '—');
  assert.strictEqual(formatWind(undefined), '—');
  assert.strictEqual(formatWind('15'), '—');
  assert.strictEqual(formatWind(Number.NaN), '—');
});

test('weather: formatPoP handles precipitation probability', () => {
  assert.strictEqual(formatPoP(0), '0%');
  assert.strictEqual(formatPoP(15.2), '15%');
  assert.strictEqual(formatPoP(50), '50%');
  assert.strictEqual(formatPoP(85.7), '86%');
  assert.strictEqual(formatPoP(100), '100%');
  assert.strictEqual(formatPoP(33.6), '34%');
  assert.strictEqual(formatPoP(null), '—');
  assert.strictEqual(formatPoP(undefined), '—');
  assert.strictEqual(formatPoP('50'), '—');
  assert.strictEqual(formatPoP(Number.NaN), '—');
});

test('weather: fetchWeatherAround propagates network failures', async () => {
  const failingFetch = () => Promise.reject(new Error('Network error'));

  await withPatchedGlobal('fetch', failingFetch, async () => {
    await expectRejectsWithMessage(
      () => fetchWeatherAround(40.7128, -74.006, new Date(), 'America/New_York'),
      'Network error',
    );
  });
});

test('weather: fetchWeatherAround throws on HTTP errors', async () => {
  const fetchWithError = () =>
    Promise.resolve({
      ok: false,
      status: 500,
    });

  await withPatchedGlobal('fetch', fetchWithError, async () => {
    await expectRejectsWithMessage(
      () => fetchWeatherAround(40.7128, -74.006, new Date(), 'America/New_York'),
      'weather fetch failed',
    );
  });
});

test('weather: fetchWetnessInputs propagates network failures', async () => {
  const failingFetch = () => Promise.reject(new Error('Connection timeout'));

  await withPatchedGlobal('fetch', failingFetch, async () => {
    await expectRejectsWithMessage(
      () => fetchWetnessInputs(40.7128, -74.006, new Date(), 'America/New_York'),
      'Connection timeout',
    );
  });
});

test('weather: fetchWetnessInputs returns safe defaults when data missing', async () => {
  const fetchWithoutDaily = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ hourly: {} }),
    });

  await withPatchedGlobal('fetch', fetchWithoutDaily, async () => {
    const wetness = await fetchWetnessInputs(
      40.7128,
      -74.006,
      new Date('2024-01-01T12:00:00Z'),
      'America/New_York',
    );

    assert.strictEqual(wetness.isWet, false);
    assert.strictEqual(wetness.wetDays, 0);
  });
});

test('weather: format helpers integrate with core constants import', () => {
  assert.strictEqual(formatTemp(72), '72°F');
  assert.strictEqual(formatWind(10), '10 mph');
  assert.strictEqual(formatPoP(30), '30%');
});
