import test from 'node:test';
import assert from 'node:assert/strict';

import {
  categorizeWetness,
  computeWetness,
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
});

test('weather: categorizeWetness maps wetness levels', () => {
  assert.strictEqual(categorizeWetness({ score: 0 }), 'Dry');
  assert.strictEqual(categorizeWetness({ score: 0.22 }), 'Moist');
  assert.strictEqual(categorizeWetness({ score: 0.65 }), 'Slick');
  assert.strictEqual(
    categorizeWetness({ score: 1.05, events: [{ balance: 0.7 }] }),
    'Slick',
  );
  assert.strictEqual(
    categorizeWetness({ score: 1.9, events: [{ balance: 1.4 }] }),
    'Soaked',
  );
});

test('weather: categorizeWetness considers snowpack and heavy events', () => {
  assert.strictEqual(
    categorizeWetness({ score: 0.05, snowpackRemaining: 0.25 }),
    'Moist',
  );
  assert.strictEqual(
    categorizeWetness({ score: 0.35, snowpackRemaining: 0.45 }),
    'Slick',
  );
  assert.strictEqual(
    categorizeWetness({ score: 1.3, events: [{ balance: 1.25 }] }),
    'Muddy',
  );
  assert.strictEqual(
    categorizeWetness({ score: 1.7, events: [{ balance: 1.35 }] }),
    'Soaked',
  );
  assert.strictEqual(
    categorizeWetness({ score: 1.4, snowpackRemaining: 0.6, events: [] }),
    'Muddy',
  );
});

test('weather: computeWetness applies decay, drying, and intensity', () => {
  const wetness = computeWetness(
    [
      {
        date: '2024-03-05',
        rain: 0.5,
        precipHours: 5,
        et0: 0.1,
      },
      {
        date: '2024-03-06',
        rain: 0.4,
        precipHours: 2,
        et0: 0.05,
      },
    ],
    { referenceDate: new Date('2024-03-07T12:00:00Z') },
  );

  assert.ok(Math.abs(wetness.score - 0.75) < 0.02);
  assert.strictEqual(wetness.analysisDays, 2);
  assert.strictEqual(wetness.recentWetDays, 2);
  assert.strictEqual(wetness.totals.precipitation, 0.9);
  assert.strictEqual(wetness.totals.melt, 0);
  assert.ok(wetness.totals.drying > 0.08 && wetness.totals.drying < 0.1);
});

test('weather: computeWetness captures snowmelt dynamics', () => {
  const wetness = computeWetness(
    [
      {
        date: '2024-02-25',
        snowfall: 1,
        et0: 0.02,
        maxTempF: 28,
      },
      {
        date: '2024-02-26',
        snowfall: 0.2,
        rain: 0.1,
        precipHours: 1,
        et0: 0.03,
        maxTempF: 37,
      },
    ],
    { referenceDate: new Date('2024-02-27T12:00:00Z') },
  );

  assert.ok(wetness.totals.melt > 0.4 && wetness.totals.melt < 0.7);
  assert.ok(wetness.snowpackRemaining < 1 && wetness.snowpackRemaining > 0.1);
  assert.ok(wetness.summary.includes('snowpack'));
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

    assert.strictEqual(wetness.score, 0);
    assert.strictEqual(wetness.analysisDays, 0);
    assert.ok(Array.isArray(wetness.events));
    assert.ok(typeof wetness.summary === 'string');
  });
});

test('weather: format helpers integrate with core constants import', () => {
  assert.strictEqual(formatTemp(72), '72°F');
  assert.strictEqual(formatWind(10), '10 mph');
  assert.strictEqual(formatPoP(30), '30%');
});
