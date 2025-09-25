/**
 * Wake Time Calculator - Time Utilities
 * Time formatting and manipulation functions
 */

/**
 * Format time in 12-hour format with timezone
 * @param {Date} date - Date object
 * @param {string} tz - Timezone string
 * @returns {string} Formatted time
 */
export const fmtTime12InZone = (date, tz) =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  });

/**
 * Format date as YYYY-MM-DD in timezone
 * @param {Date} date - Date object
 * @param {string} tz - Timezone string
 * @returns {string} Formatted date
 */
export const fmtYMDInZone = (date, tz) =>
  date
    .toLocaleDateString('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');

/**
 * Get tomorrow's date in YYYY-MM-DD format
 * @param {string} tz - Timezone string
 * @returns {string} Tomorrow's date
 */
export const tomorrowYMD = (tz) =>
  fmtYMDInZone(new Date(Date.now() + 24 * 60 * 60 * 1000), tz);

/**
 * Parse ISO date string to Date object
 * @param {string} isoString - ISO date string
 * @returns {Date} Date object
 */
export const parseISODate = (isoString) => new Date(isoString);

/**
 * Get hours and minutes from total minutes
 * @param {number} totalMinutes - Total minutes
 * @returns {object} Object with hours and minutes
 */
export const minutesToHoursAndMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

/**
 * Format duration as human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  const { hours, minutes: mins } = minutesToHoursAndMinutes(minutes);
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};
