/**
 * Wake Time Calculator - UI Module
 * UI utilities, form helpers, and display functions
 */

/**
 * Explicit list of dirt locations (robust across browsers)
 */
const DIRT_LOCATIONS = new Set(['figure8', 'huber', 'tatum', 'holmdel']);

/**
 * Check if a location requires dirt/trail conditions
 * @param {string} location - Location value
 * @returns {boolean} True if location involves dirt trails
 */
export const isDirtLocation = (location) => {
  return DIRT_LOCATIONS.has(location);
};

/**
 * Update location badge with daylight warning if needed
 * @param {string} location - Current location
 * @param {number} runStartMinutes - Run start time in minutes
 * @param {Date} dawnDate - Dawn date object
 */
export const updateLocationBadge = (location, runStartMinutes, dawnDate) => {
  const badge = document.querySelector(
    '#runLocation + .dropdown-content .badge'
  );
  if (!badge) return;

  // Import daylight check function
  import('./dawn.js').then(({ checkDaylightNeeded }) => {
    const daylightCheck = checkDaylightNeeded(runStartMinutes, dawnDate);

    if (daylightCheck.needed) {
      badge.textContent = daylightCheck.message;
      badge.classList.add('badge-warning');
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('badge-warning');
    }
  });
};

/**
 * Debounce function to limit frequent calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
