/**
 * Weather Module - Wetness Analysis
 * Interpretation logic for trail conditions
 */

import { HEAVY_EVENT_THRESHOLD, SNOW_TO_WATER_RATIO } from './constants.js';
import { numberOrNull } from './utils.js';
import { formatInches, formatSignedInches } from './formatting.js';

/**
 * Sum liquid within time window
 * @param {Array<object>} events - Event array
 * @param {number} maxAgeDays - Maximum age in days
 * @returns {number} Total liquid
 */
const sumWindowLiquid = (events, maxAgeDays) =>
  events.reduce((total, evt) => {
    if (!evt) return total;
    const age = typeof evt.ageDays === 'number' ? evt.ageDays : Infinity;
    if (age > maxAgeDays) return total;
    const liquid = Math.max(0, numberOrNull(evt.liquid) ?? 0);
    return total + liquid;
  }, 0);

/**
 * Determine confidence level based on analysis window
 * @param {number} analysisDays - Number of days analyzed
 * @returns {string} Confidence level
 */
const confidenceForWindow = (analysisDays = 0) => {
  if (analysisDays >= 6) return 'high';
  if (analysisDays >= 4) return 'medium';
  return 'low';
};

/**
 * Interpret wetness data into trail condition assessment
 * @param {object} wetnessData - Wetness data
 * @returns {object} Trail condition interpretation
 */
export const interpretWetness = (wetnessData = null) => {
  if (!wetnessData) {
    return {
      label: 'Dry',
      detail: 'No precipitation history available',
      caution: '',
      rating: 1,
      confidence: 'low',
      stats: {},
    };
  }

  const events = Array.isArray(wetnessData.events) ? wetnessData.events : [];
  const snowpackSWE = Math.max(
    0,
    numberOrNull(wetnessData.snowpackRemaining) ?? 0
  );
  const snowpackDepth =
    SNOW_TO_WATER_RATIO > 0 ? snowpackSWE / SNOW_TO_WATER_RATIO : snowpackSWE;
  const recentWetDays = Math.max(
    0,
    numberOrNull(wetnessData.recentWetDays) ?? 0
  );

  const totals = wetnessData.totals ?? {};
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
  const dryingTotal = Math.max(0, numberOrNull(totals.drying) ?? 0);
  const et0Total = Math.max(0, numberOrNull(totals.et0) ?? 0);
  const netLiquid = Math.max(0, totalLiquid - dryingTotal);

  const last24 = sumWindowLiquid(events, 1.1);
  const last48 = sumWindowLiquid(events, 2.1);
  const last72 = sumWindowLiquid(events, 3.1);
  const wetDaysLast72 = events.reduce((count, evt) => {
    if (!evt) return count;
    const age = typeof evt.ageDays === 'number' ? evt.ageDays : Infinity;
    if (age > 3) return count;
    const liquidAmt = Math.max(0, numberOrNull(evt.liquid) ?? 0);
    const meltAmt = Math.max(0, numberOrNull(evt.melt) ?? 0);
    return liquidAmt + meltAmt >= 0.02 ? count + 1 : count;
  }, 0);

  const heavyEvent = events.some(
    (evt) =>
      typeof evt?.balance === 'number' && evt.balance >= HEAVY_EVENT_THRESHOLD
  );

  const freezeThawCycles = events.reduce((count, evt) => {
    if (
      typeof evt?.minTempF === 'number' &&
      typeof evt?.maxTempF === 'number' &&
      evt.minTempF <= 30 &&
      evt.maxTempF >= 34
    ) {
      return count + 1;
    }
    return count;
  }, 0);

  const detailParts = [];
  if (last24 > 0.01) {
    detailParts.push(`${formatInches(last24)} last 24h`);
  } else if (last48 > 0.01) {
    detailParts.push(`${formatInches(last48)} over 48h`);
  } else if (last72 > 0.01) {
    detailParts.push(`${formatInches(last72)} over 72h`);
  }

  if (dryingTotal > 0.05) {
    const dryingFraction =
      et0Total > 0.05 ? Math.min(1, dryingTotal / et0Total) : null;
    const dryingDescriptor =
      dryingFraction !== null
        ? `-${formatInches(dryingTotal)} drying (${Math.round(
            dryingFraction * 100
          )}% of ${formatInches(et0Total)} ET₀)`
        : `-${formatInches(dryingTotal)} drying`;
    detailParts.push(dryingDescriptor);
  }

  if (recentWetDays > 0) {
    detailParts.push(
      `${recentWetDays} wet day${recentWetDays === 1 ? '' : 's'}`
    );
  }

  const moistSignal = last72 >= 0.05 || netLiquid >= 0.15 || wetDaysLast72 >= 1;

  const freezeWithLiquid =
    freezeThawCycles > 0 &&
    (last24 >= 0.02 || last48 >= 0.03 || moistSignal || snowpackDepth >= 0.1);

  const freezeOnly = freezeThawCycles > 0 && !freezeWithLiquid;

  const stats = {
    last24,
    last48,
    last72,
    weeklyLiquid: totalLiquid,
    weeklyRainfall: totalRainfall,
    weeklyMelt: totalMelt,
    dryingTotal,
    et0Total,
    netLiquid,
    snowpack: snowpackDepth,
    snowpackDepth,
    snowpackSWE,
    recentWetDays,
    heavyEvent,
    freezeThawCycles,
    wetDaysLast72,
    freezeWithLiquid,
    moistSignal,
  };

  const confidence = confidenceForWindow(wetnessData.analysisDays);
  if (confidence !== 'high') {
    detailParts.push(`${confidence} confidence`);
  }

  let label = 'Dry';
  let caution = '';
  let rating = 1;

  if (snowpackDepth >= 1) {
    label = 'Snowbound';
    caution = 'Deep snow coverage—expect winter footing throughout.';
    rating = 5;
  } else if (snowpackDepth >= 0.25) {
    label = 'Packed Snow';
    caution = 'Lingering snow/ice—microspikes recommended.';
    rating = 4;
  } else {
    if (last24 >= 0.6 || netLiquid >= 1.3 || (last48 >= 0.9 && heavyEvent)) {
      label = 'Soaked';
      caution = 'Standing water and boot-sucking mud—plan for slow miles.';
      rating = 5;
    } else if (
      last48 >= 0.45 ||
      (last72 >= 0.6 && netLiquid >= 0.6) ||
      heavyEvent ||
      freezeThawCycles >= 2
    ) {
      label = 'Muddy';
      caution = 'Trail bed is saturated—gaiters/poles will help stability.';
      rating = 4;
    } else if (
      last72 >= 0.25 ||
      recentWetDays >= 3 ||
      netLiquid >= 0.35 ||
      freezeWithLiquid
    ) {
      const icy = freezeWithLiquid;
      label = icy ? 'Slick/Icy' : 'Slick';
      caution = icy
        ? 'Freeze-thaw has glazed shady sections—watch for ice.'
        : 'Soft tacky ground—expect slower corners and climbs.';
      rating = 3;
    } else if (moistSignal) {
      label = 'Moist';
      caution = '';
      rating = 2;
    }
  }

  if (freezeOnly) {
    caution = caution
      ? `${caution} Icy bridges possible from overnight refreeze.`
      : 'Freeze-thaw overnight—bridges may still be icy despite dry tread.';
    rating = Math.max(rating, 2);
  }

  const decision = (() => {
    if (label === 'Muddy' || label === 'Soaked' || label === 'Snowbound') {
      return 'Avoid';
    }
    if (
      label === 'Slick' ||
      label === 'Slick/Icy' ||
      label === 'Packed Snow' ||
      Boolean(caution)
    ) {
      return 'Caution';
    }
    return 'OK';
  })();

  const metricsSummary = [
    `24h ${formatInches(last24)}`,
    `48h ${formatInches(last48)}`,
    `72h ${formatInches(last72)}`,
    `Net ${formatSignedInches(netLiquid)}`,
  ];
  if (totalLiquid > 0.01) {
    metricsSummary.push(`Liquid ${formatInches(totalLiquid)} (7d)`);
  }
  if (totalMelt > 0.01) {
    metricsSummary.push(`Melt ${formatInches(totalMelt)} (7d)`);
  }
  if (wetDaysLast72 > 0) {
    metricsSummary.push(
      `${wetDaysLast72} wet day${wetDaysLast72 === 1 ? '' : 's'} (72h)`
    );
  }
  if (freezeThawCycles > 0) {
    metricsSummary.push(`Freeze/thaw ${freezeThawCycles}`);
  }

  const detail =
    [...detailParts, metricsSummary.join(' · ')].filter(Boolean).join(' · ') ||
    wetnessData.summary ||
    '';

  return {
    label,
    detail,
    caution,
    rating,
    confidence,
    stats,
    decision,
  };
};

/**
 * Get wetness category label
 * @param {object} wetnessData - Wetness data
 * @returns {string} Category label
 */
export const categorizeWetness = (wetnessData) =>
  interpretWetness(wetnessData).label;
