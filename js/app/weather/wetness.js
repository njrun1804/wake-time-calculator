/**
 * Weather Module - Wetness Calculations
 * Core moisture score and precipitation dynamics
 */

import {
  MS_PER_DAY,
  DEFAULT_DECAY_BASE,
  DEFAULT_DRYING_COEFFICIENT,
  SNOW_MELT_THRESHOLD_F,
  MAX_INTENSITY_BOOST,
  SNOW_TO_WATER_RATIO,
} from './constants.js';
import { numberOrNull, coerceNumber, sortByDate } from './utils.js';
import { inches } from './formatting.js';

/**
 * Create wetness summary text
 * @param {object} wetness - Wetness data
 * @returns {string} Summary text
 */
const createWetnessSummary = (wetness) => {
  if (!wetness) return 'No recent precipitation signal';

  const parts = [];
  const {
    totals = {},
    recentWetDays = 0,
    analysisDays = 0,
    snowpackRemaining = 0,
  } = wetness;

  const totalRainfall = (() => {
    const explicit =
      numberOrNull(totals.rainfall) ?? numberOrNull(totals.rain) ?? null;
    if (explicit !== null) return Math.max(0, explicit);
    const precip = numberOrNull(totals.precipitation);
    const melt = numberOrNull(totals.melt);
    if (precip !== null && melt !== null) {
      return Math.max(0, precip - melt);
    }
    return Math.max(0, precip ?? 0);
  })();

  const totalMelt = Math.max(0, numberOrNull(totals.melt) ?? 0);
  const totalLiquid = totalRainfall + totalMelt;

  if (totalLiquid > 0.01) {
    const windowText = analysisDays ? `${analysisDays}d` : 'recent';
    parts.push(`${inches(totalLiquid)} liquid over ${windowText}`);
  }
  if (totalMelt > 0.01) {
    parts.push(`${inches(totalMelt)} melt contributions`);
  }
  if (typeof totals.drying === 'number' && totals.drying > 0.01) {
    const et0Total = typeof totals.et0 === 'number' ? totals.et0 : null;
    const dryingFraction =
      et0Total && et0Total > 0 ? Math.min(1, totals.drying / et0Total) : null;
    const dryingSummary =
      dryingFraction !== null
        ? `-${inches(totals.drying)} drying (${Math.round(
            dryingFraction * 100
          )}% of ${inches(et0Total)} ET₀)`
        : `-${inches(totals.drying)} drying`;
    parts.push(dryingSummary);
  }
  if (snowpackRemaining > 0) {
    const snowDepth =
      SNOW_TO_WATER_RATIO > 0
        ? snowpackRemaining / SNOW_TO_WATER_RATIO
        : snowpackRemaining;
    if (snowDepth > 0.05) {
      const sweText = inches(snowpackRemaining);
      const depthText = inches(snowDepth);
      parts.push(`${sweText} SWE (${depthText} depth) snowpack remains`);
    }
  }
  if (recentWetDays > 0) {
    parts.push(`${recentWetDays} wet day${recentWetDays === 1 ? '' : 's'}`);
  }

  if (parts.length === 0) {
    return 'No meaningful precipitation in the past week';
  }

  return parts.join(' · ');
};

/**
 * Compute a moisture score based on precipitation, drying, and snowmelt dynamics.
 * @param {Array<object>} dailyRecords
 * @param {object} [options]
 * @param {Date} [options.referenceDate]
 * @param {number} [options.decayBase]
 * @param {number} [options.dryingCoefficient]
 * @returns {object}
 */
export const computeWetness = (
  dailyRecords = [],
  {
    referenceDate = null,
    decayBase = DEFAULT_DECAY_BASE,
    dryingCoefficient = DEFAULT_DRYING_COEFFICIENT,
  } = {}
) => {
  if (!Array.isArray(dailyRecords) || dailyRecords.length === 0) {
    const base = {
      score: 0,
      analysisDays: 0,
      recentWetDays: 0,
      totals: {
        rainfall: 0,
        melt: 0,
        drying: 0,
        et0: 0,
      },
      snowpackRemaining: 0,
      events: [],
      referenceDate: referenceDate ? new Date(referenceDate) : null,
    };
    return {
      ...base,
      summary: createWetnessSummary(base),
    };
  }

  const refDate = referenceDate ? new Date(referenceDate) : null;
  const referenceMidnight = refDate ? new Date(refDate) : null;
  if (referenceMidnight) {
    referenceMidnight.setHours(0, 0, 0, 0);
  }
  const sorted = sortByDate(dailyRecords);

  let cumulativeScore = 0;
  let runningSnowpack = 0;
  let totalRain = 0;
  let totalLiquid = 0; // eslint-disable-line no-unused-vars -- used later in weekly metrics
  let totalMelt = 0;
  let totalDrying = 0;
  let totalEt0 = 0;
  let recentWetDays = 0;
  let peakDailyBalance = 0;

  const events = sorted.map((entry, index) => {
    const {
      date,
      precipitation,
      rain,
      snowfall,
      precipHours,
      et0,
      maxTempF,
      minTempF,
    } = entry;

    const precipTotal = coerceNumber(precipitation);
    const rainIn = numberOrNull(rain) ?? precipTotal;
    const snowDepthIn = Math.max(0, numberOrNull(snowfall) ?? 0);
    const snowSwe = snowDepthIn * SNOW_TO_WATER_RATIO;
    const et0In = Math.max(0, numberOrNull(et0) ?? 0);
    totalEt0 += et0In;

    runningSnowpack += snowSwe;

    let melt = 0;
    const thawTemp = numberOrNull(maxTempF);
    if (
      runningSnowpack > 0 &&
      thawTemp !== null &&
      thawTemp >= SNOW_MELT_THRESHOLD_F
    ) {
      const thawFactor = Math.min(1, (thawTemp - 32) / 10);
      melt = Math.min(
        runningSnowpack,
        runningSnowpack * Math.max(0.1, thawFactor)
      );
      runningSnowpack = Math.max(0, runningSnowpack - melt);
    }

    totalMelt += melt;

    const rainContribution = Math.max(0, rainIn);
    const liquid = rainContribution + melt;
    totalRain += rainContribution;
    totalLiquid += liquid;

    const intensityBoost = (() => {
      const hours = numberOrNull(precipHours);
      if (!hours || hours <= 0) {
        return liquid > 0.35 ? MAX_INTENSITY_BOOST : 1.15;
      }
      const rate = liquid / hours;
      if (rate >= 0.35) return MAX_INTENSITY_BOOST;
      if (rate >= 0.2) return 1.2;
      if (rate >= 0.1) return 1.1;
      return 1;
    })();

    const entryDate = date ? new Date(date) : null;
    const month = entryDate
      ? entryDate.getMonth()
      : refDate
        ? refDate.getMonth()
        : new Date().getMonth();
    const leafOn = month >= 3 && month <= 9; // Apr–Oct
    const warmSeasonCoefficient = dryingCoefficient;
    const coolSeasonCoefficient = Math.max(0, dryingCoefficient * 0.5);
    const seasonalDryingCoefficient = leafOn
      ? warmSeasonCoefficient
      : coolSeasonCoefficient;
    const drying = seasonalDryingCoefficient * et0In;
    totalDrying += drying;

    const dailyBalance = (liquid - drying) * intensityBoost;
    peakDailyBalance = Math.max(peakDailyBalance, dailyBalance);

    if (liquid > 0.05) {
      recentWetDays += 1;
    }

    const ageDays = (() => {
      if (referenceMidnight && date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const diff = (referenceMidnight - dayStart) / MS_PER_DAY;
        return Number.isFinite(diff) && diff > 0 ? diff : 0;
      }
      const offset = sorted.length - 1 - index;
      return offset < 0 ? 0 : offset;
    })();

    const decay = Math.pow(decayBase, ageDays);
    const decayedBalance = dailyBalance * decay;
    cumulativeScore += decayedBalance;

    return {
      date,
      rain: rainIn,
      snowfall: snowDepthIn,
      snowfallSWE: snowSwe,
      melt,
      et0: et0In,
      precipHours: numberOrNull(precipHours),
      maxTempF: thawTemp,
      minTempF: numberOrNull(minTempF),
      liquid,
      drying,
      balance: dailyBalance,
      decayedBalance,
      decay,
      ageDays,
    };
  });

  const normalizedScore =
    cumulativeScore + Math.max(0, peakDailyBalance * 0.05);

  const result = {
    score: Math.max(0, Number.isFinite(normalizedScore) ? normalizedScore : 0),
    analysisDays: sorted.length,
    recentWetDays,
    totals: {
      rainfall: Number(totalRain.toFixed(3)),
      melt: Number(totalMelt.toFixed(3)),
      drying: Number(totalDrying.toFixed(3)),
      et0: Number(totalEt0.toFixed(3)),
    },
    snowpackRemaining: Number(runningSnowpack.toFixed(3)),
    events,
    referenceDate: refDate,
  };

  return {
    ...result,
    summary: createWetnessSummary(result),
  };
};
