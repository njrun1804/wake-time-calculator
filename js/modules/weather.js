/**
 * Wake Time Calculator - Weather Module
 * Handles weather data fetching and processing
 */

import { CACHE_DURATION } from '../core/constants.js';

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
      daily: 'precipitation_sum,precipitation_hours',
      timezone: tz,
      start_date: startYMD,
      end_date: dawnYMD,
      precipitation_unit: 'inch',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('wetness fetch failed');

    const data = await res.json();
    if (!data.daily) return { isWet: false, wetDays: 0 };

    // Keep only days strictly BEFORE the dawn day (we're judging surface state going into dawn)
    const filteredData = [];
    data.daily.time.forEach((dayStr, i) => {
      if (typeof dayStr === 'string' && dayStr < dawnYMD) {
        filteredData.push({
          date: dayStr,
          precipSum: data.daily.precipitation_sum?.[i] ?? 0,
          precipHours: data.daily.precipitation_hours?.[i] ?? 0,
        });
      }
    });

    // Analyze wetness
    let totalPrecip = 0;
    let wetDays = 0;
    filteredData.forEach((day) => {
      totalPrecip += day.precipSum;
      if (day.precipSum > 0.1) wetDays++; // Significant precipitation
    });

    const avgPrecip =
      filteredData.length > 0 ? totalPrecip / filteredData.length : 0;
    const isWet = wetDays >= 2 || avgPrecip > 0.3;

    return {
      isWet,
      wetDays,
      totalPrecip,
      avgPrecip,
      days: filteredData.length,
    };
  });
};

/**
 * Categorize wetness level for display
 * @param {object} wetnessData - Wetness data from fetchWetnessInputs
 * @returns {string} Wetness category
 */
export const categorizeWetness = (wetnessData) => {
  if (!wetnessData || !wetnessData.isWet) return 'Dry';

  if (wetnessData.wetDays >= 4) return 'Very Wet';
  if (wetnessData.wetDays >= 2) return 'Wet';
  if (wetnessData.avgPrecip > 0.5) return 'Wet';

  return 'Slightly Wet';
};

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
