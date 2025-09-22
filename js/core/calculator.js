/**
 * Wake Time Calculator - Core Calculator Module
 * Pure functions for time calculations
 */

import { MINUTES_PER_DAY, MINUTES_PER_HOUR, PREP_MINUTES, PREP_BEFORE_RUN } from './constants.js';

/**
 * Convert time string to minutes since midnight
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export const toMinutes = (time) => {
  const [h, m] = time.split(':').map((s) => Number.parseInt(s, 10));
  return h * MINUTES_PER_HOUR + m;
};

/**
 * Convert minutes to time string
 * @param {number} total - Total minutes
 * @returns {string} Time in HH:MM format
 */
export const fromMinutes = (total) => {
  const minutes = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(minutes / MINUTES_PER_HOUR);
  const m = minutes % MINUTES_PER_HOUR;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Format 24-hour time to 12-hour format
 * @param {string} time24 - Time in HH:MM format
 * @returns {string} Time in h:mm AM/PM format
 */
export const format12 = (time24) => {
  const [h, m] = time24.split(':');
  const hour = Number.parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
};

/**
 * Sanitize minute input
 * @param {string|number} value - Input value
 * @param {number} fallback - Fallback value
 * @returns {number} Sanitized minutes
 */
export const sanitizeMinutes = (value, fallback) => {
  const number = Number.parseInt(value, 10);
  if (!Number.isNaN(number) && number >= 0 && number <= 999) {
    return number;
  }
  return fallback;
};

/**
 * Calculate wake time based on inputs
 * @param {object} params - Calculation parameters
 * @param {string} params.meeting - First meeting time (HH:MM)
 * @param {number} params.runMinutes - Run duration in minutes
 * @param {number} params.travelMinutes - Travel time in minutes
 * @param {number} params.breakfastMinutes - Breakfast duration in minutes
 * @returns {object} Calculation results
 */
export const calculateWakeTime = ({
  meeting,
  runMinutes = 0,
  travelMinutes = 0,
  breakfastMinutes = 0
}) => {
  const meetingMinutes = toMinutes(meeting);

  // Calculate total time needed
  const totalMinutes = PREP_MINUTES + runMinutes + travelMinutes + breakfastMinutes;

  // Calculate wake time
  const wakeMinutes = meetingMinutes - totalMinutes;
  const previousDay = wakeMinutes < 0;
  const adjustedWakeMinutes = previousDay ? wakeMinutes + MINUTES_PER_DAY : wakeMinutes;

  // Calculate intermediate times
  const prepStartMinutes = meetingMinutes - PREP_MINUTES;
  const runStartMinutes = prepStartMinutes - runMinutes - travelMinutes;
  const latestWakeMinutes = prepStartMinutes - runMinutes;

  return {
    wakeTime: fromMinutes(adjustedWakeMinutes),
    wakeTime12: format12(fromMinutes(adjustedWakeMinutes)),
    totalMinutes,
    previousDay,
    runStartTime: fromMinutes(runStartMinutes),
    runStartTime12: format12(fromMinutes(runStartMinutes)),
    latestWakeTime: fromMinutes(latestWakeMinutes),
    latestWakeTime12: format12(fromMinutes(latestWakeMinutes)),
    durations: {
      prep: PREP_MINUTES,
      prepBeforeRun: PREP_BEFORE_RUN,
      run: runMinutes,
      travel: travelMinutes,
      breakfast: breakfastMinutes
    }
  };
};