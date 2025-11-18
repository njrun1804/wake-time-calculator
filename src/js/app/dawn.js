/**
 * Dawn Module - Consolidated
 *
 * This module handles dawn time calculations:
 * - Fetches sunrise/sunset data from API
 * - Caches dawn times to reduce API load
 * - Checks if run times need daylight warnings
 * - Provides testing utilities
 *
 * Data Flow:
 * 1. fetchDawn → SunriseSunset.io API → cached Date object
 * 2. checkDaylightNeeded → compares run start vs dawn → warning if needed
 */

// External dependencies
import {
  CACHE_DURATION,
  defaultTz,
  MINUTES_PER_DAY,
} from "../lib/constants.js";
import { fmtYMDInZone } from "../lib/time.js";

// ============================================================================
// API INTEGRATION & CACHING
// ============================================================================

/**
 * Dawn cache for API responses
 */
const dawnCache = {};

/**
 * Maximum number of entries to keep in cache
 */
const MAX_CACHE_ENTRIES = 50;

/**
 * Clean up expired cache entries
 * Removes entries older than maxAge and limits total cache size
 * @param {number} maxAge - Maximum age in milliseconds
 */
const cleanupDawnCache = (maxAge = CACHE_DURATION) => {
  const now = Date.now();
  const keys = Object.keys(dawnCache);

  // Remove expired entries
  for (const key of keys) {
    if (now - dawnCache[key].time > maxAge) {
      delete dawnCache[key];
    }
  }

  // If still over limit, remove oldest entries
  const remainingKeys = Object.keys(dawnCache);
  if (remainingKeys.length > MAX_CACHE_ENTRIES) {
    const sorted = remainingKeys.sort(
      (a, b) => dawnCache[a].time - dawnCache[b].time,
    );
    const toRemove = sorted.slice(0, remainingKeys.length - MAX_CACHE_ENTRIES);
    for (const key of toRemove) {
      delete dawnCache[key];
    }
  }
};

/**
 * Cache dawn data with timestamp
 * @param {string} key - Cache key
 * @param {Date} data - Dawn date to cache
 */
const cacheDawn = (key, data) => {
  dawnCache[key] = { data, time: Date.now() };

  // Cleanup cache periodically (10% chance on each cache write)
  if (Math.random() < 0.1) {
    cleanupDawnCache();
  }
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
 *
 * Uses SunriseSunset.io API to get civil dawn time (when the sun is 6°
 * below the horizon). Results are cached for CACHE_DURATION to reduce API load.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} tz - Timezone (IANA format, e.g., 'America/Denver')
 * @param {AbortSignal} signal - Abort signal (optional)
 * @returns {Promise<Date>} Dawn time as Date object
 * @throws {Error} If API fetch fails
 *
 * @example
 * const dawnDate = await fetchDawn(40.015, -105.270, 'America/Denver');
 * console.log(`Tomorrow's dawn: ${dawnDate.toLocaleTimeString()}`);
 */
export const fetchDawn = async (lat, lon, tz = defaultTz, signal = null) => {
  const ymd = fmtYMDInZone(new Date(Date.now() + 24 * 60 * 60 * 1000), tz);
  const key = `dawn_${lat}_${lon}_${ymd}`;

  const cached = getCachedDawn(key);
  if (cached) return cached;

  try {
    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=tomorrow&time_format=unix`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("Failed to fetch dawn time");

    const data = await res.json();
    if (!data.results || data.status !== "OK") {
      throw new Error("No dawn data available");
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

// ============================================================================
// ASTRONOMY & DAYLIGHT CHECKS
// ============================================================================

/**
 * Check if a run time requires daylight warning (starts at or before dawn)
 *
 * Calculation:
 * - minutesFromDawn = (run start) - (dawn time)
 * - Negative = before dawn (dark) → warning needed
 * - Zero = at dawn (twilight) → warning needed
 * - Positive = after dawn (daylight) → no warning
 *
 * @param {number} runStartMinutes - Run start time in minutes since midnight
 * @param {Date} dawnDate - Dawn date object
 * @returns {object} Result with needed (boolean), message (string), minutesBefore (number)
 *
 * @example
 * const result = checkDaylightNeeded(330, new Date('2024-01-01T06:30:00'));
 * // runStart=330 (5:30am), dawn=390 (6:30am)
 * // Returns: { needed: true, message: "Check daylight (60 min before dawn)", minutesBefore: 60 }
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
        ? "Check daylight (at dawn)"
        : `Check daylight (${minBefore} min before dawn)`;

    return { needed: true, message, minutesBefore: minBefore };
  }

  // Running after dawn, no warning needed
  return { needed: false, message: null };
};

/**
 * Set a test dawn time (for debugging/testing)
 *
 * Creates a Date object for today with the specified hours/minutes.
 * Useful for testing dawn-dependent features without waiting for actual dawn.
 *
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {Date} Test dawn date
 *
 * @example
 * const testDawn = setTestDawn(6, 30); // 6:30 AM today
 */
export const setTestDawn = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
