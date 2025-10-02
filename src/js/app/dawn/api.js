/**
 * Dawn Module - API Integration
 * Sunrise/sunset API fetching and caching
 */

import { CACHE_DURATION, defaultTz } from '../../lib/constants.js';
import { fmtYMDInZone } from '../../lib/time.js';

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
    if (!data.results || data.status !== 'OK') {
      throw new Error('no dawn results');
    }

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
