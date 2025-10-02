/**
 * Weather Module - API Integration
 * API fetching and caching
 */

import { CACHE_DURATION } from '../../lib/constants.js';
import { Storage } from '../../lib/storage.js';
import { snowCodes } from './constants.js';
import { numberOrNull } from './utils.js';
import { computeWetness } from './wetness.js';

/**
 * Fetch data with caching using Storage module
 * @param {string} key - Cache key
 * @param {Function} fetcher - Function that returns Promise<data>
 * @param {AbortSignal} signal - Abort signal
 * @returns {Promise<any>} Cached or fresh data
 */
const fetchWithCache = async (key, fetcher, signal = null) => {
  const cached = Storage.loadCache(key, CACHE_DURATION);
  if (cached) return cached;

  try {
    const data = await fetcher(signal);
    Storage.saveCache(key, data);
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn(`Fetch failed for ${key}:`, error);
    throw error;
  }
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

    // First try exact match
    let index = times.findIndex((t) => new Date(t).getHours() === targetHour);

    // If no exact match, find the closest hour
    if (index === -1 && times.length > 0) {
      let closestIndex = 0;
      let smallestDiff = Math.abs(new Date(times[0]).getHours() - targetHour);

      for (let i = 1; i < times.length; i++) {
        const hourDiff = Math.abs(new Date(times[i]).getHours() - targetHour);
        if (hourDiff < smallestDiff) {
          smallestDiff = hourDiff;
          closestIndex = i;
        }
      }
      index = closestIndex;
    }

    if (index === -1) throw new Error('no hourly data available');

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

    // Note: createWetnessSummary is called inside computeWetness
    return wetness;
  });
};
