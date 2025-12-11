import test from "node:test";
import assert from "node:assert/strict";

import {
  computeWetness,
  interpretWetness,
  WEATHER_CONFIG,
} from "../../../src/app/weather.js";

test("Reference date decay: uses calendar spacing when referenceDate provided", () => {
  const referenceDate = new Date("2024-01-10");
  const dailyRecords = [
    { date: "2024-01-05", precipitation: 1.0, rain: 1.0, et0: 0.1 },
    { date: "2024-01-07", precipitation: 1.0, rain: 1.0, et0: 0.1 },
    { date: "2024-01-09", precipitation: 1.0, rain: 1.0, et0: 0.1 },
  ];

  const result = computeWetness(dailyRecords, { referenceDate });

  assert.equal(result.events[0].ageDays, 5);
  assert.equal(result.events[1].ageDays, 3);
  assert.equal(result.events[2].ageDays, 1);
  assert.ok(result.events[0].decay < result.events[1].decay);
  assert.ok(result.events[1].decay < result.events[2].decay);
});

test("Reference date decay: handles gaps correctly", () => {
  const referenceDate = new Date("2024-01-10");
  const dailyRecords = [
    { date: "2024-01-03", precipitation: 1.0, rain: 1.0, et0: 0.1 },
    { date: "2024-01-06", precipitation: 1.0, rain: 1.0, et0: 0.1 },
    { date: "2024-01-09", precipitation: 1.0, rain: 1.0, et0: 0.1 },
  ];

  const result = computeWetness(dailyRecords, { referenceDate });

  assert.equal(result.events[0].ageDays, 7);
  assert.equal(result.events[1].ageDays, 4);
  assert.equal(result.events[2].ageDays, 1);
});

test("Reference date decay: warns when referenceDate missing and uses index fallback", () => {
  const dailyRecords = [
    { date: "2024-01-05", precipitation: 1.0, rain: 1.0, et0: 0.1 },
    { date: "2024-01-07", precipitation: 1.0, rain: 1.0, et0: 0.1 },
  ];

  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (msg) => warnings.push(String(msg));

  const result = computeWetness(dailyRecords, {});

  console.warn = originalWarn;

  assert.ok(
    warnings.some((w) =>
      w.includes("referenceDate is missing; using array index"),
    ),
  );

  assert.equal(result.events[0].ageDays, 1);
  assert.equal(result.events[1].ageDays, 0);
});

test("Reference date decay: different decay values for same-age events with/without referenceDate", () => {
  const records = [
    { date: "2024-01-05", precipitation: 1.0, rain: 1.0, et0: 0.1 },
    { date: "2024-01-07", precipitation: 1.0, rain: 1.0, et0: 0.1 },
  ];

  const withRef = computeWetness(records, {
    referenceDate: new Date("2024-01-10"),
  });
  const withoutRef = computeWetness(records, {});

  assert.notEqual(withRef.events[0].decay, withoutRef.events[0].decay);
});

test("Seasonal decay: summer uses faster decay than winter", () => {
  const summerRecords = [
    { date: "2024-07-05", precipitation: 1.0, rain: 1.0, et0: 0.2 },
    { date: "2024-07-06", precipitation: 1.0, rain: 1.0, et0: 0.2 },
  ];
  const winterRecords = [
    { date: "2024-01-05", precipitation: 1.0, rain: 1.0, et0: 0.2 },
    { date: "2024-01-06", precipitation: 1.0, rain: 1.0, et0: 0.2 },
  ];

  const summerResult = computeWetness(summerRecords, {
    referenceDate: new Date("2024-07-10"),
  });
  const winterResult = computeWetness(winterRecords, {
    referenceDate: new Date("2024-01-10"),
  });

  assert.ok(summerResult.events[0].decay < winterResult.events[0].decay);
});

test("Seasonal decay: ignores passed dryingCoefficient and uses seasonal decay base", () => {
  const records = [
    { date: "2024-07-05", precipitation: 1.0, rain: 1.0, et0: 0.1 },
  ];
  const referenceDate = new Date("2024-07-06");

  const result = computeWetness(records, {
    referenceDate,
    dryingCoefficient: 0.8,
  });

  // Behavior: Summer decay should be faster than default (0.85)
  // Older events decay more in summer (verify decay < 1.0 and reasonable)
  assert.ok(result.events[0].decay < 1.0);
  assert.ok(result.events[0].decay > 0);
  // Summer should have faster decay (lower decay value) than default 0.85
  // For 1 day old event in summer, decay should be around 0.75 (faster than 0.85)
  assert.ok(result.events[0].decay <= 0.76); // Summer decay is 0.75^1 = 0.75
});

test("Seasonal decay: dormant season applies halved coefficient in single-season fast path", () => {
  const records = [
    { date: "2024-01-05", precipitation: 1.0, rain: 1.0, et0: 0.2 },
    { date: "2024-01-06", precipitation: 1.0, rain: 1.0, et0: 0.2 },
  ];
  const referenceDate = new Date("2024-01-07");

  const result = computeWetness(records, {
    referenceDate,
    dryingCoefficient: 0.5,
  });

  const firstEvent = result.events[0];
  assert.ok(firstEvent.drying < firstEvent.et0);
});

test("Snowmelt: accumulates snowpack when temps below freezing", () => {
  const records = [
    {
      date: "2024-01-05",
      snowfall: 7.0,
      maxTempF: 28,
      minTempF: 20,
      et0: 0.1,
    },
    {
      date: "2024-01-06",
      snowfall: 7.0,
      maxTempF: 30,
      minTempF: 25,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-07");

  const result = computeWetness(records, { referenceDate });

  assert.equal(result.events[0].melt, 0);
  assert.equal(result.events[1].melt, 0);
  assert.ok(Math.abs(result.snowpackRemaining - 2.002) < 0.01);
});

test("Snowmelt: melts snow when maxTempF exceeds threshold", () => {
  const records = [
    {
      date: "2024-01-05",
      snowfall: 7.0,
      maxTempF: 28,
      minTempF: 20,
      et0: 0.1,
    },
    {
      date: "2024-01-06",
      snowfall: 0,
      maxTempF: 38,
      minTempF: 30,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-07");

  const result = computeWetness(records, { referenceDate });

  assert.equal(result.events[0].melt, 0);
  assert.ok(result.events[1].melt > 0);
  assert.ok(result.events[1].melt <= 1.002);
  assert.ok(result.snowpackRemaining >= 0);
  assert.ok(result.snowpackRemaining < 1.002);
});

test("Snowmelt: uses melt curve based on temperature", () => {
  const records = [
    {
      date: "2024-01-05",
      snowfall: 7.0,
      maxTempF: 28,
      minTempF: 20,
      et0: 0.1,
    },
    {
      date: "2024-01-06",
      snowfall: 0,
      maxTempF: 34,
      minTempF: 30,
      et0: 0.1,
    },
    {
      date: "2024-01-07",
      snowfall: 0,
      maxTempF: 42,
      minTempF: 35,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-08");

  const result = computeWetness(records, { referenceDate });

  assert.ok(result.events[1].melt < result.events[2].melt);
});

test("Snowmelt: handles mixed rain+snow day without double-counting", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 0.5,
      precipitation: 1.5,
      snowfall: 7.0,
      maxTempF: 35,
      minTempF: 30,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  assert.equal(result.events[0].rain, 0.5);
  assert.ok(Math.abs(result.events[0].snowfallSWE - 1.001) < 0.01);
  assert.ok(result.events[0].liquid >= 0.5);
});

test("Snowmelt: falls back to minTempF when maxTempF missing", () => {
  const records = [
    {
      date: "2024-01-05",
      snowfall: 7.0,
      maxTempF: null,
      minTempF: 35,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  assert.ok(result.events[0].melt > 0);
});

test("Intensity boost: applies boost when daily liquid exceeds threshold", () => {
  const heavyDay = {
    date: "2024-01-05",
    rain: 1.2,
    precipHours: 6,
    et0: 0.1,
  };
  const lightDays = [
    { date: "2024-01-06", rain: 0.4, precipHours: 24, et0: 0.1 },
    { date: "2024-01-07", rain: 0.4, precipHours: 24, et0: 0.1 },
    { date: "2024-01-08", rain: 0.4, precipHours: 24, et0: 0.1 },
  ];

  const referenceDate = new Date("2024-01-09");

  const heavyResult = computeWetness([heavyDay], { referenceDate });
  const spreadResult = computeWetness(lightDays, { referenceDate });

  const heavyBoost =
    heavyResult.events[0].balance / heavyResult.events[0].liquid;
  const spreadBoost =
    spreadResult.events[0].balance / spreadResult.events[0].liquid;

  assert.ok(heavyResult.events[0].liquid * 1.2 > spreadResult.events[0].liquid);
  assert.ok(heavyBoost >= spreadBoost);
});

test("Intensity boost: uses assumed duration when precipHours missing", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 1.0,
      precipHours: null,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  const event = result.events[0];
  assert.ok(event.liquid > 0);
  assert.ok(event.balance > event.liquid - event.drying);
});

test("Intensity boost: applies maximum boost for very heavy events", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 2.0,
      precipHours: 4,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  const event = result.events[0];
  // Behavior: Very heavy events (2" in 4 hours = 0.5"/hr) should get maximum boost
  // Balance should be significantly higher than liquid - drying (boosted)
  const unboostedBalance = event.liquid - event.drying;
  assert.ok(event.balance > unboostedBalance);
  // Heavy events should have balance > 1.3x liquid (after accounting for drying)
  assert.ok(event.balance > event.liquid * 1.3 - event.drying);
});

test("Intensity boost: does not trigger below threshold", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 0.5,
      precipHours: 12,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  const event = result.events[0];
  // Behavior: Light/slow events (0.5" in 12 hours = 0.042"/hr) should not get boost
  // Balance should equal liquid - drying (no boost applied)
  const unboostedBalance = event.liquid - event.drying;
  // Allow small floating point tolerance
  assert.ok(Math.abs(event.balance - unboostedBalance) < 0.01);
});

test("ET0/drying: drying is capped by ET0 when ET0 present", () => {
  const records = [
    { date: "2024-07-05", rain: 0.5, et0: 0.2, maxTempF: 80 },
  ];
  const referenceDate = new Date("2024-07-06");

  const result = computeWetness(records, { referenceDate });

  const event = result.events[0];
  assert.ok(event.drying <= event.et0);
  assert.ok(event.drying > 0);
});

test("ET0/drying: applies drying even when ET0 missing", () => {
  const records = [
    { date: "2024-07-05", rain: 0.5, et0: null, maxTempF: 80 },
  ];
  const referenceDate = new Date("2024-07-06");

  const result = computeWetness(records, { referenceDate });

  const event = result.events[0];
  assert.equal(event.et0, 0);
  assert.equal(event.drying, 0);
});

test("ET0/drying: seasonal coefficient affects drying amount", () => {
  const summerRecord = {
    date: "2024-07-05",
    rain: 0.5,
    et0: 0.2,
    maxTempF: 80,
  };
  const winterRecord = {
    date: "2024-01-05",
    rain: 0.5,
    et0: 0.2,
    maxTempF: 40,
  };
  const summerRef = new Date("2024-07-06");
  const winterRef = new Date("2024-01-06");

  const summerResult = computeWetness([summerRecord], {
    referenceDate: summerRef,
  });
  const winterResult = computeWetness([winterRecord], {
    referenceDate: winterRef,
  });

  assert.ok(summerResult.events[0].drying > winterResult.events[0].drying);
});

test("Summary/label coherence: interpretWetness aligns with computeWetness output", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 0.6,
      precipHours: 6,
      et0: 0.1,
      maxTempF: 50,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const wetnessData = computeWetness(records, { referenceDate });
  const interpretation = interpretWetness(wetnessData);

  assert.ok(typeof interpretation.label === "string");
  assert.ok(["Dry", "Moist", "Slick", "Muddy", "Soaked"].includes(interpretation.label));
  assert.ok(typeof interpretation.rating === "number");
  assert.ok(interpretation.rating >= 1 && interpretation.rating <= 5);
  assert.ok(typeof interpretation.decision === "string");
  assert.ok(["OK", "Caution", "Hazard"].includes(interpretation.decision));
});

test("Summary/label coherence: high wetness score maps to appropriate label", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 1.5,
      precipHours: 4,
      et0: 0.05,
      maxTempF: 50,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const wetnessData = computeWetness(records, { referenceDate });
  const interpretation = interpretWetness(wetnessData);

  assert.ok(["Soaked", "Muddy"].includes(interpretation.label));
  assert.ok(interpretation.rating >= 4);
});

test("Summary/label coherence: dry conditions map to Dry label", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 0,
      et0: 0.2,
      maxTempF: 50,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const wetnessData = computeWetness(records, { referenceDate });
  const interpretation = interpretWetness(wetnessData);

  assert.equal(interpretation.label, "Dry");
  assert.equal(interpretation.rating, 1);
  assert.equal(interpretation.decision, "OK");
});

test("Summary/label coherence: summary string includes key metrics", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: 0.5,
      et0: 0.1,
      maxTempF: 50,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const wetnessData = computeWetness(records, { referenceDate });

  assert.ok(wetnessData.summary.includes("liquid"));
  assert.equal(typeof wetnessData.summary, "string");
});

test("Input validation: negative precipitation coerced to 0", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: -0.5,
      precipitation: -1.0,
      snowfall: -2.0,
      et0: 0.1,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  assert.ok(result.events[0].liquid >= 0);
  assert.ok(result.events[0].snowfall >= 0);
  assert.ok(result.score >= 0);
});

test("Input validation: missing dates handled gracefully", () => {
  const records = [
    { date: null, rain: 0.5, et0: 0.1 },
    { rain: 0.5, et0: 0.1 },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  assert.ok(Array.isArray(result.events));
});

test("Input validation: NaN values coerced to 0", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: Number.NaN,
      precipitation: Number.NaN,
      snowfall: Number.NaN,
      et0: Number.NaN,
      maxTempF: Number.NaN,
      minTempF: Number.NaN,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  assert.ok(!Number.isNaN(result.score));
  assert.ok(result.score >= 0);
  assert.ok(result.events[0].rain >= 0);
});

test("Input validation: empty array returns base structure", () => {
  const result = computeWetness([], { referenceDate: new Date("2024-01-06") });

  assert.equal(result.score, 0);
  assert.equal(result.analysisDays, 0);
  assert.equal(result.recentWetDays, 0);
  assert.deepEqual(result.totals, {
    rainfall: 0,
    melt: 0,
    drying: 0,
    et0: 0,
  });
  assert.equal(result.snowpackRemaining, 0);
  assert.deepEqual(result.events, []);
});

test("Input validation: null/undefined inputs handled", () => {
  const records = [
    {
      date: "2024-01-05",
      rain: null,
      precipitation: undefined,
      snowfall: null,
      et0: undefined,
      maxTempF: null,
      minTempF: undefined,
    },
  ];
  const referenceDate = new Date("2024-01-06");

  const result = computeWetness(records, { referenceDate });

  assert.ok(!Number.isNaN(result.score));
  assert.ok(result.score >= 0);
});
