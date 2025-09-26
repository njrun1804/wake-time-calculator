import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretWetness } from '../../js/app/weather.js';

const WETNESS_RANK = Object.freeze({
  Dry: 0,
  Moist: 1,
  Slick: 2,
  'Slick/Icy': 2,
  Muddy: 3,
  Soaked: 4,
  'Packed Snow': 4,
  Snowbound: 5,
});

const buildWetness = (daily) => {
  const events = daily.map((entry) => ({
    ageDays: entry.ageDays,
    liquid: entry.liquid ?? 0,
    melt: entry.melt ?? 0,
    balance: entry.balance ?? entry.liquid ?? 0,
    decayedBalance: entry.decayedBalance ?? entry.balance ?? entry.liquid ?? 0,
    precipHours: entry.precipHours ?? 1,
    maxTempF: entry.maxTempF ?? 40,
    minTempF: entry.minTempF ?? 32,
    et0: entry.et0 ?? 0,
  }));

  const totals = daily.reduce(
    (acc, entry) => {
      acc.precipitation += entry.liquid ?? 0;
      acc.melt += entry.melt ?? 0;
      acc.drying += entry.drying ?? 0;
      acc.et0 += entry.et0 ?? 0;
      return acc;
    },
    { precipitation: 0, melt: 0, drying: 0, et0: 0 }
  );

  const recentWetDays = daily.filter((entry) => (entry.liquid ?? 0) > 0.05).length;

  return {
    analysisDays: daily.length,
    recentWetDays,
    totals,
    snowpackRemaining: 0,
    events,
  };
};

test('additional rainfall cannot downgrade wetness label', () => {
  const baseline = buildWetness([
    { ageDays: 1, liquid: 0.06, precipHours: 2, balance: 0.06 },
    { ageDays: 2, liquid: 0, precipHours: 1, balance: 0 },
    { ageDays: 3, liquid: 0, precipHours: 1, balance: 0 },
  ]);
  const baselineLabel = interpretWetness(baseline).label;

  const wetter = buildWetness([
    { ageDays: 1, liquid: 0.06, precipHours: 2, balance: 0.06 },
    { ageDays: 2, liquid: 0.3, precipHours: 3, balance: 0.3 },
    { ageDays: 3, liquid: 0.1, precipHours: 3, balance: 0.1 },
  ]);
  const wetterLabel = interpretWetness(wetter).label;

  assert.ok(
    WETNESS_RANK[wetterLabel] >= WETNESS_RANK[baselineLabel],
    `Expected "${wetterLabel}" to be no drier than "${baselineLabel}"`
  );
});

test('freeze-thaw without liquid keeps dry label but surfaces caution', () => {
  const freezeOnly = buildWetness([
    { ageDays: 1, liquid: 0, precipHours: 0, balance: 0, maxTempF: 35, minTempF: 26 },
    { ageDays: 2, liquid: 0, precipHours: 0, balance: 0, maxTempF: 33, minTempF: 24 },
  ]);

  const insight = interpretWetness(freezeOnly);
  assert.equal(insight.label, 'Dry');
  assert.ok(
    insight.caution.includes('Freeze-thaw'),
    'Expected caution to warn about freeze-thaw refreeze'
  );
});

test('freeze-thaw with recent moisture escalates to slick icy', () => {
  const icy = buildWetness([
    { ageDays: 1, liquid: 0.08, precipHours: 2, balance: 0.08, maxTempF: 36, minTempF: 27 },
    { ageDays: 2, liquid: 0.04, precipHours: 2, balance: 0.04, maxTempF: 42, minTempF: 33 },
  ]);

  const insight = interpretWetness(icy);
  assert.equal(insight.label, 'Slick/Icy');
});

test('net liquid subtracts the full scaled drying total', () => {
  const dryingHeavy = buildWetness([
    { ageDays: 0.5, liquid: 0.2, drying: 0.08, et0: 0.2 },
    { ageDays: 1.5, liquid: 0.15, drying: 0.06, et0: 0.15 },
    { ageDays: 2.4, liquid: 0.05, drying: 0.04, et0: 0.1 },
  ]);

  const insight = interpretWetness(dryingHeavy);

  assert.equal(insight.stats.dryingTotal.toFixed(2), '0.18');
  assert.equal(insight.stats.et0Total.toFixed(2), '0.45');
  assert.equal(insight.stats.netLiquid.toFixed(2), '0.22');
  assert.ok(
    insight.detail.includes('40% of 0.45" ET₀'),
    'Expected tooltip to call out 40% ET₀ drying basis'
  );
});
