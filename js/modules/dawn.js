/**
 * Wake Time Calculator - Dawn Module
 * Handles dawn/sunrise times and daylight calculations
 */

import {
  CACHE_DURATION,
  defaultTz,
  MINUTES_PER_DAY,
} from '../core/constants.js';
import { fmtYMDInZone } from '../utils/time.js';

/**
 * Dawn cache for API responses
 */
const dawnCache = {};

/**
 * Cache dawn data with timestamp
 * @param {string} key - Cache key
 * @param {Date} data - Dawn date to cache
 */
const cacheDawn = (key, data) => {
  dawnCache[key] = { data, time: Date.now() };
};

/**
 * Get cached dawn data if not expired
 * @param {string} key - Cache key
 * @param {number} maxAge - Max age in milliseconds
 * @returns {Date|null} Cached dawn date or null if expired/missing
 */
const getCachedDawn = (key, maxAge = CACHE_DURATION) => {
  const cached = dawnCache[key];
  if (cached && Date.now() - cached.time < maxAge) {
    return cached.data;
  }
  return null;
};

/**
 * Fetch dawn time for tomorrow at given coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} tz - Timezone (optional)
 * @param {AbortSignal} signal - Abort signal (optional)
 * @returns {Promise<Date>} Dawn time as Date object
 */
export const fetchDawn = async (lat, lon, tz = defaultTz, signal = null) => {
  const ymd = fmtYMDInZone(new Date(Date.now() + 24 * 60 * 60 * 1000), tz);
  const key = `dawn_${lat}_${lon}_${ymd}`;

  const cached = getCachedDawn(key);
  if (cached) return cached;

  try {
    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=tomorrow&time_format=unix`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('dawn fetch failed');

    const data = await res.json();
    if (!data.results || data.status !== 'OK')
      throw new Error('no dawn results');

    const dawnEpoch = data.results.dawn;
    const dawnDate = new Date(dawnEpoch * 1000);

    cacheDawn(key, dawnDate);
    return dawnDate;
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn(`Dawn fetch failed for ${lat}, ${lon}:`, error);
    throw error;
  }
};

/**
 * Check if a run time requires daylight warning (starts at or before dawn)
 * @param {number} runStartMinutes - Run start time in minutes since midnight
 * @param {Date} dawnDate - Dawn date object
 * @returns {object} Daylight check result
 */
export const checkDaylightNeeded = (runStartMinutes, dawnDate) => {
  if (!dawnDate) {
    return { needed: false, message: null };
  }

  // Get dawn time in minutes since midnight
  const dawnHours = dawnDate.getHours();
  const dawnMins = dawnDate.getMinutes();
  const dawnTotalMinutes = dawnHours * 60 + dawnMins;

  // Calculate minutes from dawn (positive = after dawn, negative = before dawn)
  const minutesFromDawn =
    (runStartMinutes % MINUTES_PER_DAY) - dawnTotalMinutes;

  if (minutesFromDawn <= 0) {
    // Running at or before dawn (dark)
    const minBefore = Math.abs(minutesFromDawn);
    const message =
      minBefore === 0
        ? 'Check daylight (at dawn)'
        : `Check daylight (${minBefore} min before dawn)`;

    return { needed: true, message, minutesBefore: minBefore };
  }

  // Running after dawn, no warning needed
  return { needed: false, message: null };
};

/**
 * Set a test dawn time (for debugging/testing)
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {Date} Test dawn date
 */
export const setTestDawn = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
