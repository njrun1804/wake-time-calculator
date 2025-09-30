/**
 * Unit tests for weather/wetness.js - computeWetness function
 * Tests core moisture score calculation and precipitation dynamics
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeWetness } from '../../../../js/app/weather/wetness.js';

// Test empty input
test('computeWetness returns zero state for empty array', () => {
  const result = computeWetness([]);

  assert.equal(result.score, 0);
  assert.equal(result.analysisDays, 0);
  assert.equal(result.recentWetDays, 0);
  assert.equal(result.totals.rainfall, 0);
  assert.equal(result.totals.melt, 0);
  assert.equal(result.totals.drying, 0);
  assert.equal(result.totals.et0, 0);
  assert.equal(result.snowpackRemaining, 0);
  assert.deepEqual(result.events, []);
  assert.equal(result.summary, 'No meaningful precipitation in the past week');
});

// Test null input
test('computeWetness handles null input gracefully', () => {
  const result = computeWetness(null);

  assert.equal(result.score, 0);
  assert.equal(result.analysisDays, 0);
  assert.equal(result.summary, 'No meaningful precipitation in the past week');
});

// Test undefined input
test('computeWetness handles undefined input gracefully', () => {
  const result = computeWetness(undefined);

  assert.equal(result.score, 0);
  assert.equal(result.analysisDays, 0);
});

// Test single day with rain only
test('computeWetness calculates simple rain event', () => {
  const records = [
    {
      date: '2025-01-15',
      precipitation: 0.5,
      rain: 0.5,
      snowfall: 0,
      precipHours: 3,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-16'),
  });

  assert.ok(result.score > 0, 'Score should be positive');
  assert.equal(result.analysisDays, 1);
  assert.equal(result.recentWetDays, 1);
  assert.equal(result.totals.rainfall, 0.5);
  assert.equal(result.totals.melt, 0);
  assert.ok(result.totals.drying > 0, 'Drying should be positive');
  assert.ok(
    result.summary.includes('liquid'),
    'Summary should mention liquid'
  );
});

// Test snowfall accumulation
test('computeWetness accumulates snowpack', () => {
  const records = [
    {
      date: '2025-01-15',
      precipitation: 1.0,
      rain: 0,
      snowfall: 10.0, // 10 inches of snow
      precipHours: 6,
      et0: 0.05,
      maxTempF: 28,
      minTempF: 20,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-16'),
  });

  // 10 inches snow * 0.1 ratio = 1.0 SWE
  assert.equal(result.snowpackRemaining, 1.0);
  assert.ok(
    result.summary.includes('snowpack'),
    'Summary should mention snowpack'
  );
});

// Test snowmelt with warm temperatures
test('computeWetness calculates snowmelt when warm', () => {
  const records = [
    {
      date: '2025-01-15',
      precipitation: 1.0,
      rain: 0,
      snowfall: 10.0,
      precipHours: 6,
      et0: 0.05,
      maxTempF: 28,
      minTempF: 20,
    },
    {
      date: '2025-01-16',
      precipitation: 0,
      rain: 0,
      snowfall: 0,
      precipHours: 0,
      et0: 0.1,
      maxTempF: 45, // Above melt threshold (34°F)
      minTempF: 35,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-17'),
  });

  assert.ok(result.totals.melt > 0, 'Melt should be positive');
  assert.ok(
    result.snowpackRemaining < 1.0,
    'Snowpack should decrease from melt'
  );
  assert.ok(result.summary.includes('melt'), 'Summary should mention melt');
});

// Test drying from ET0
test('computeWetness applies drying from evapotranspiration', () => {
  const records = [
    {
      date: '2025-06-15', // Summer month (leafOn = true)
      precipitation: 0.3,
      rain: 0.3,
      snowfall: 0,
      precipHours: 2,
      et0: 0.2,
      maxTempF: 75,
      minTempF: 60,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-06-16'),
    dryingCoefficient: 0.6,
  });

  // Drying = 0.6 * 0.2 = 0.12
  assert.ok(Math.abs(result.totals.drying - 0.12) < 0.01);
  assert.equal(result.totals.et0, 0.2);
});

// Test seasonal drying coefficient (winter vs summer)
test('computeWetness applies lower drying in winter', () => {
  const winterRecord = {
    date: '2025-01-15', // Winter month (leafOn = false)
    precipitation: 0.3,
    rain: 0.3,
    snowfall: 0,
    precipHours: 2,
    et0: 0.2,
    maxTempF: 45,
    minTempF: 35,
  };

  const summerRecord = {
    date: '2025-06-15', // Summer month (leafOn = true)
    precipitation: 0.3,
    rain: 0.3,
    snowfall: 0,
    precipHours: 2,
    et0: 0.2,
    maxTempF: 75,
    minTempF: 60,
  };

  const winterResult = computeWetness([winterRecord], {
    referenceDate: new Date('2025-01-16'),
    dryingCoefficient: 0.6,
  });

  const summerResult = computeWetness([summerRecord], {
    referenceDate: new Date('2025-06-16'),
    dryingCoefficient: 0.6,
  });

  // Winter drying should be half of summer
  assert.ok(
    winterResult.totals.drying < summerResult.totals.drying,
    'Winter drying should be less than summer'
  );
  assert.ok(
    Math.abs(winterResult.totals.drying - summerResult.totals.drying / 2) <
      0.01,
    'Winter should be approximately half'
  );
});

// Test intensity boost for heavy rain
test('computeWetness applies intensity boost for heavy rain', () => {
  const lightRain = [
    {
      date: '2025-01-15',
      precipitation: 0.2,
      rain: 0.2,
      snowfall: 0,
      precipHours: 4, // 0.05 in/hr - no boost
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const heavyRain = [
    {
      date: '2025-01-15',
      precipitation: 1.4,
      rain: 1.4,
      snowfall: 0,
      precipHours: 3, // 0.47 in/hr - max boost (>= 0.35)
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const lightResult = computeWetness(lightRain, {
    referenceDate: new Date('2025-01-16'),
  });

  const heavyResult = computeWetness(heavyRain, {
    referenceDate: new Date('2025-01-16'),
  });

  assert.ok(
    heavyResult.score > lightResult.score,
    'Heavy rain should have higher score'
  );
});

// Test decay over multiple days
test('computeWetness applies time decay to older events', () => {
  const records = [
    {
      date: '2025-01-10', // 5 days ago
      precipitation: 0.5,
      rain: 0.5,
      snowfall: 0,
      precipHours: 3,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
    {
      date: '2025-01-14', // 1 day ago
      precipitation: 0.5,
      rain: 0.5,
      snowfall: 0,
      precipHours: 3,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-15'),
    decayBase: 0.85,
  });

  // Recent event should have higher decayed balance
  assert.ok(
    result.events[1].decayedBalance > result.events[0].decayedBalance,
    'Recent event should contribute more to score'
  );
  assert.ok(result.events[0].ageDays > result.events[1].ageDays);
});

// Test wet day counting
test('computeWetness counts wet days correctly', () => {
  const records = [
    {
      date: '2025-01-10',
      precipitation: 0.1,
      rain: 0.1,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    }, // > 0.05 liquid = wet
    {
      date: '2025-01-11',
      precipitation: 0.02,
      rain: 0.02,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    }, // < 0.05 liquid = not wet
    {
      date: '2025-01-12',
      precipitation: 0.08,
      rain: 0.08,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    }, // > 0.05 liquid = wet
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-13'),
  });

  assert.equal(result.recentWetDays, 2, 'Should count 2 wet days');
});

// Test custom decay base
test('computeWetness respects custom decay base', () => {
  const records = [
    {
      date: '2025-01-10',
      precipitation: 0.5,
      rain: 0.5,
      snowfall: 0,
      precipHours: 3,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const fastDecay = computeWetness(records, {
    referenceDate: new Date('2025-01-15'),
    decayBase: 0.5, // Fast decay
  });

  const slowDecay = computeWetness(records, {
    referenceDate: new Date('2025-01-15'),
    decayBase: 0.95, // Slow decay
  });

  assert.ok(
    slowDecay.score > fastDecay.score,
    'Slower decay should result in higher score'
  );
});

// Test summary generation with multiple conditions
test('computeWetness generates comprehensive summary', () => {
  const records = [
    {
      date: '2025-01-14',
      precipitation: 0.5,
      rain: 0.5,
      snowfall: 0,
      precipHours: 3,
      et0: 0.15,
      maxTempF: 45,
      minTempF: 35,
    },
    {
      date: '2025-01-15',
      precipitation: 0.3,
      rain: 0.3,
      snowfall: 0,
      precipHours: 2,
      et0: 0.12,
      maxTempF: 50,
      minTempF: 40,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-16'),
  });

  assert.ok(
    result.summary.includes('liquid'),
    'Summary should mention liquid'
  );
  assert.ok(
    result.summary.includes('drying'),
    'Summary should mention drying'
  );
  assert.ok(
    result.summary.includes('wet day'),
    'Summary should mention wet days'
  );
});

// Test edge case: no precipitation but ET0 present
test('computeWetness handles drying-only scenario', () => {
  const records = [
    {
      date: '2025-06-15',
      precipitation: 0,
      rain: 0,
      snowfall: 0,
      precipHours: 0,
      et0: 0.25,
      maxTempF: 85,
      minTempF: 65,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-06-16'),
  });

  assert.equal(result.totals.rainfall, 0);
  assert.ok(result.totals.drying > 0);
  assert.equal(result.recentWetDays, 0);
});

// Test sorting of unsorted records
test('computeWetness sorts records by date', () => {
  const records = [
    {
      date: '2025-01-15',
      precipitation: 0.2,
      rain: 0.2,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
    {
      date: '2025-01-13',
      precipitation: 0.3,
      rain: 0.3,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
    {
      date: '2025-01-14',
      precipitation: 0.1,
      rain: 0.1,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-16'),
  });

  // Verify events are sorted
  assert.equal(result.events[0].date, '2025-01-13');
  assert.equal(result.events[1].date, '2025-01-14');
  assert.equal(result.events[2].date, '2025-01-15');
});

// Test peak daily balance contribution
test('computeWetness includes peak daily balance in score', () => {
  const records = [
    {
      date: '2025-01-14',
      precipitation: 2.0, // Large event
      rain: 2.0,
      snowfall: 0,
      precipHours: 2, // High intensity
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
    {
      date: '2025-01-15',
      precipitation: 0.1,
      rain: 0.1,
      snowfall: 0,
      precipHours: 1,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-16'),
  });

  // Score should be influenced by peak event
  assert.ok(result.score > 0);
  assert.ok(
    result.events[0].balance > result.events[1].balance,
    'First event should have larger balance'
  );
});

// Test event properties are correctly calculated
test('computeWetness calculates all event properties', () => {
  const records = [
    {
      date: '2025-01-15',
      precipitation: 0.5,
      rain: 0.5,
      snowfall: 0,
      precipHours: 3,
      et0: 0.1,
      maxTempF: 45,
      minTempF: 35,
    },
  ];

  const result = computeWetness(records, {
    referenceDate: new Date('2025-01-16'),
  });

  const event = result.events[0];
  assert.equal(event.date, '2025-01-15');
  assert.equal(event.rain, 0.5);
  assert.equal(event.snowfall, 0);
  assert.equal(event.snowfallSWE, 0);
  assert.equal(event.melt, 0);
  assert.equal(event.et0, 0.1);
  assert.equal(event.precipHours, 3);
  assert.equal(event.maxTempF, 45);
  assert.equal(event.minTempF, 35);
  assert.ok(event.liquid > 0);
  assert.ok(event.drying > 0);
  assert.ok(typeof event.balance === 'number');
  assert.ok(typeof event.decayedBalance === 'number');
  assert.ok(typeof event.decay === 'number');
  assert.ok(typeof event.ageDays === 'number');
});