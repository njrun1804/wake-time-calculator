/**
 * Wake Time Calculator - Weather Module
 * Handles weather data fetching and processing
 */

import { CACHE_DURATION } from '../lib/constants.js';

const MS_PER_DAY = 86400000;

const DEFAULT_DRYING_COEFFICIENT = 0.6;
const DEFAULT_DECAY_BASE = 0.85;
const SNOW_MELT_THRESHOLD_F = 34;
const MAX_INTENSITY_BOOST = 1.35;

/**
 * Weather cache for API responses
 */
const weatherCache = {};

/**
 * Weather codes that indicate snow
 */
const snowCodes = new Set([71, 73, 75, 77, 85, 86]);

/**
 * Cache data with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
const cacheData = (key, data) => {
  weatherCache[key] = { data, time: Date.now() };
};

/**
 * Get cached data if not expired
 * @param {string} key - Cache key
 * @param {number} maxAge - Max age in milliseconds
 * @returns {any|null} Cached data or null if expired/missing
 */
const getCachedData = (key, maxAge = CACHE_DURATION) => {
  const cached = weatherCache[key];
  if (cached && Date.now() - cached.time < maxAge) {
    return cached.data;
  }
  return null;
};

/**
 * Fetch data with caching
 * @param {string} key - Cache key
 * @param {Function} fetcher - Function that returns Promise<data>
 * @param {AbortSignal} signal - Abort signal
 * @returns {Promise<any>} Cached or fresh data
 */
const fetchWithCache = async (key, fetcher, signal = null) => {
  const cached = getCachedData(key);
  if (cached) return cached;

  try {
    const data = await fetcher(signal);
    cacheData(key, data);
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn(`Fetch failed for ${key}:`, error);
    throw error;
  }
};

const numberOrNull = (value) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : null;

const coerceNumber = (value) => numberOrNull(value) ?? 0;

const sortByDate = (records) =>
  [...records].sort((a, b) => {
    if (!a?.date || !b?.date) return 0;
    if (a.date === b.date) return 0;
    return a.date < b.date ? -1 : 1;
  });

const inches = (value) => `${value.toFixed(2)}"`;

const createWetnessSummary = (wetness) => {
  if (!wetness) return 'No recent precipitation signal';

  const parts = [];
  const {
    totals = {},
    recentWetDays = 0,
    analysisDays = 0,
    snowpackRemaining = 0,
  } = wetness;

  if (typeof totals.precipitation === 'number' && totals.precipitation > 0.01) {
    const windowText = analysisDays ? `${analysisDays}d` : 'recent';
    parts.push(`${inches(totals.precipitation)} liquid over ${windowText}`);
  }
  if (typeof totals.melt === 'number' && totals.melt > 0.01) {
    parts.push(`${inches(totals.melt)} melt contributions`);
  }
  if (typeof totals.drying === 'number' && totals.drying > 0.01) {
    parts.push(`-${inches(totals.drying)} drying`);
  }
  if (snowpackRemaining > 0.05) {
    parts.push(`${inches(snowpackRemaining)} snowpack remains`);
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
        precipitation: 0,
        melt: 0,
        drying: 0,
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
  let totalPrecip = 0;
  let totalMelt = 0;
  let totalDrying = 0;
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
    const snowIn = Math.max(0, numberOrNull(snowfall) ?? 0);
    const et0In = Math.max(0, numberOrNull(et0) ?? 0);

    runningSnowpack += snowIn;

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

    const liquid = Math.max(0, rainIn) + melt;
    totalPrecip += liquid;

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
      snowfall: snowIn,
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
      precipitation: Number(totalPrecip.toFixed(3)),
      melt: Number(totalMelt.toFixed(3)),
      drying: Number(totalDrying.toFixed(3)),
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

/**
 * Fetch weather data around a specific time
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Date} whenLocal - Local time to get weather for
 * @param {string} tz - Timezone
 * @returns {Promise<object>} Weather data
 */
export const fetchWeatherAround = async (lat, lon, whenLocal, tz) => {
  const hrKey = `hourly_${lat}_${lon}_${Math.floor(whenLocal.getTime() / 3600000)}`;

  return fetchWithCache(hrKey, async (signal) => {
    const ymd = whenLocal.toLocaleDateString('en-CA');
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      hourly:
        'temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,precipitation_probability,wet_bulb_temperature_2m,weathercode,snowfall',
      timezone: tz,
      start_date: ymd,
      end_date: ymd,
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('weather fetch failed');

    const data = await res.json();
    if (!data.hourly) throw new Error('no hourly data');

    // Find closest hour to the target time
    const targetHour = whenLocal.getHours();
    const times = data.hourly.time;
    const index = times.findIndex((t) => new Date(t).getHours() === targetHour);
    if (index === -1) throw new Error('no matching hour');

    const weatherCode = data.hourly.weathercode?.[index];
    const tempF = data.hourly.temperature_2m?.[index] ?? null;
    const windMph = data.hourly.wind_speed_10m?.[index] ?? null;
    const pop = data.hourly.precipitation_probability?.[index] ?? null;
    const wetBulbF = data.hourly.wet_bulb_temperature_2m?.[index] ?? null;
    const snowfall = data.hourly.snowfall?.[index] ?? null;

    // Calculate wind chill
    let windChillF = null;
    if (typeof tempF === 'number' && typeof windMph === 'number') {
      if (tempF <= 50 && windMph >= 3) {
        windChillF =
          35.74 +
          0.6215 * tempF -
          35.75 * Math.pow(windMph, 0.16) +
          0.4275 * tempF * Math.pow(windMph, 0.16);
      } else {
        windChillF = tempF;
      }
    }

    // Determine if it's snowy conditions
    const isSnow =
      (typeof weatherCode === 'number' && snowCodes.has(weatherCode)) ||
      (typeof snowfall === 'number' && snowfall > 0);

    return {
      tempF,
      windMph,
      windChillF,
      pop,
      wetBulbF,
      isSnow,
      weatherCode,
      snowfall,
    };
  });
};

/**
 * Fetch wetness inputs (precipitation data for surface conditions)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Date} dawnLocalDate - Dawn date in local time
 * @param {string} tz - Timezone
 * @returns {Promise<object>} Wetness/surface condition data
 */
export const fetchWetnessInputs = async (lat, lon, dawnLocalDate, tz) => {
  const dawnYMD = dawnLocalDate.toLocaleDateString('en-CA');
  const key = `wetness_${lat}_${lon}_${dawnYMD}`;

  return fetchWithCache(key, async (signal) => {
    // Get 7 days of historical data before dawn day
    const startDate = new Date(dawnLocalDate);
    startDate.setDate(startDate.getDate() - 7);
    const startYMD = startDate.toLocaleDateString('en-CA');

    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      daily:
        'precipitation_sum,precipitation_hours,rain_sum,snowfall_sum,et0_fao_evapotranspiration,temperature_2m_max,temperature_2m_min',
      timezone: tz,
      start_date: startYMD,
      end_date: dawnYMD,
      precipitation_unit: 'inch',
      temperature_unit: 'fahrenheit',
      snowfall_unit: 'inch',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('wetness fetch failed');

    const data = await res.json();
    if (!data.daily) {
      return computeWetness([], { referenceDate: dawnLocalDate });
    }

    // Keep only days strictly BEFORE the dawn day (we're judging surface state going into dawn)
    const dailyRecords = [];
    const {
      time: days,
      precipitation_sum: precipTotals = [],
      precipitation_hours: precipHours = [],
      rain_sum: rainTotals = [],
      snowfall_sum: snowTotals = [],
      et0_fao_evapotranspiration: et0Totals = [],
      temperature_2m_max: maxTemps = [],
      temperature_2m_min: minTemps = [],
    } = data.daily;

    days.forEach((dayStr, index) => {
      if (typeof dayStr !== 'string' || dayStr >= dawnYMD) return;

      dailyRecords.push({
        date: dayStr,
        precipitation: numberOrNull(precipTotals[index]),
        rain: numberOrNull(rainTotals[index]),
        snowfall: numberOrNull(snowTotals[index]),
        precipHours: numberOrNull(precipHours[index]),
        et0: numberOrNull(et0Totals[index]),
        maxTempF: numberOrNull(maxTemps[index]),
        minTempF: numberOrNull(minTemps[index]),
      });
    });

    const wetness = computeWetness(dailyRecords, {
      referenceDate: dawnLocalDate,
    });
    return {
      ...wetness,
      summary: createWetnessSummary(wetness),
    };
  });
};

/**
 * Categorize wetness level for display
 * @param {object} wetnessData - Wetness data from fetchWetnessInputs
 * @returns {string} Wetness category
 */
const HEAVY_EVENT_THRESHOLD = 1.2;

const sumWindowLiquid = (events, maxAgeDays) =>
  events.reduce((total, evt) => {
    if (!evt) return total;
    const age = typeof evt.ageDays === 'number' ? evt.ageDays : Infinity;
    if (age > maxAgeDays) return total;
    const liquid = Math.max(0, numberOrNull(evt.liquid) ?? 0);
    return total + liquid;
  }, 0);

const formatInches = (value) =>
  value >= 0.995 ? `${value.toFixed(1)}"` : `${value.toFixed(2)}"`;

const formatSignedInches = (value) => {
  const magnitude = Math.abs(value);
  const formatted = formatInches(magnitude);
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatted}`;
};

const confidenceForWindow = (analysisDays = 0) => {
  if (analysisDays >= 6) return 'high';
  if (analysisDays >= 4) return 'medium';
  return 'low';
};

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
  const snowpack = Math.max(
    0,
    numberOrNull(wetnessData.snowpackRemaining) ?? 0
  );
  const recentWetDays = Math.max(
    0,
    numberOrNull(wetnessData.recentWetDays) ?? 0
  );

  const totals = wetnessData.totals ?? {};
  const totalLiquid =
    Math.max(0, numberOrNull(totals.precipitation) ?? 0) +
    Math.max(0, numberOrNull(totals.melt) ?? 0);
  const dryingTotal = Math.max(0, numberOrNull(totals.drying) ?? 0);
  const netLiquid = Math.max(0, totalLiquid - dryingTotal * 0.4);

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
    detailParts.push(`-${formatInches(dryingTotal)} drying`);
  }

  if (recentWetDays > 0) {
    detailParts.push(
      `${recentWetDays} wet day${recentWetDays === 1 ? '' : 's'}`
    );
  }

  const moistSignal =
    last72 >= 0.05 || netLiquid >= 0.15 || wetDaysLast72 >= 1;

  const freezeWithLiquid =
    freezeThawCycles > 0 &&
    (last24 >= 0.02 || last48 >= 0.03 || moistSignal || snowpack >= 0.1);

  const freezeOnly = freezeThawCycles > 0 && !freezeWithLiquid;

  const stats = {
    last24,
    last48,
    last72,
    weeklyLiquid: totalLiquid,
    dryingTotal,
    netLiquid,
    snowpack,
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

  if (snowpack >= 1) {
    label = 'Snowbound';
    caution = 'Deep snow coverage—expect winter footing throughout.';
    rating = 5;
  } else if (snowpack >= 0.25) {
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
      caution =
        'Mostly runnable with the odd soft pocket—good for long efforts.';
      rating = 2;
    }
  }

  if (freezeOnly) {
    caution = caution
      ? `${caution} Icy bridges possible from overnight refreeze.`
      : 'Freeze-thaw overnight—bridges may still be icy despite dry tread.';
    rating = Math.max(rating, 2);
  }

  const metricsSummary = [
    `24h ${formatInches(last24)}`,
    `48h ${formatInches(last48)}`,
    `72h ${formatInches(last72)}`,
    `Net ${formatSignedInches(netLiquid)}`,
  ];
  if (wetDaysLast72 > 0) {
    metricsSummary.push(
      `${wetDaysLast72} wet day${wetDaysLast72 === 1 ? '' : 's'} (72h)`
    );
  }
  if (freezeThawCycles > 0) {
    metricsSummary.push(`Freeze/thaw ${freezeThawCycles}`);
  }

  const detail =
    [...detailParts, metricsSummary.join(' · ')]
      .filter(Boolean)
      .join(' · ') || wetnessData.summary || '';

  return {
    label,
    detail,
    caution,
    rating,
    confidence,
    stats,
  };
};

export const categorizeWetness = (wetnessData) =>
  interpretWetness(wetnessData).label;

/**
 * Format temperature with fallback
 * @param {number|null} temp - Temperature in Fahrenheit
 * @returns {string} Formatted temperature
 */
export const formatTemp = (temp) => {
  return typeof temp === 'number' && !isNaN(temp)
    ? `${Math.round(temp)}°F`
    : '—';
};

/**
 * Format wind speed with fallback
 * @param {number|null} wind - Wind speed in mph
 * @returns {string} Formatted wind speed
 */
export const formatWind = (wind) => {
  return typeof wind === 'number' && !isNaN(wind)
    ? `${Math.round(wind)} mph`
    : '—';
};

/**
 * Format probability of precipitation
 * @param {number|null} pop - Probability of precipitation (0-100)
 * @returns {string} Formatted PoP
 */
export const formatPoP = (pop) => {
  return typeof pop === 'number' && !isNaN(pop) ? `${Math.round(pop)}%` : '—';
};
