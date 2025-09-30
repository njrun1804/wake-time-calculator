/**
 * Dawn Module - Astronomy
 * Daylight calculations and astronomy utilities
 */

import { MINUTES_PER_DAY } from '../../lib/constants.js';

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
