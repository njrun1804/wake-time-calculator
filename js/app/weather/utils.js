/**
 * Weather Module - Utility Functions
 * Shared utility functions for data validation and transformation
 */

/**
 * Convert value to number or null
 * @param {any} value - Value to convert
 * @returns {number|null} Number or null if invalid
 */
export const numberOrNull = (value) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : null;

/**
 * Convert value to number with fallback to 0
 * @param {any} value - Value to convert
 * @returns {number} Number or 0 if invalid
 */
export const coerceNumber = (value) => numberOrNull(value) ?? 0;

/**
 * Sort records by date
 * @param {Array<object>} records - Records with date property
 * @returns {Array<object>} Sorted records
 */
export const sortByDate = (records) =>
  [...records].sort((a, b) => {
    if (!a?.date || !b?.date) return 0;
    if (a.date === b.date) return 0;
    return a.date < b.date ? -1 : 1;
  });
