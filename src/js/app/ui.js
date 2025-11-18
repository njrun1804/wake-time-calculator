/**
 * Wake Time Calculator - UI Module
 * UI utilities, form helpers, and display functions
 */

import { checkDaylightNeeded } from "./dawn.js";

/**
 * Update location badge with daylight warning if needed
 * @param {string} location - Current location
 * @param {number} runStartMinutes - Run start time in minutes
 * @param {Date} dawnDate - Dawn date object
 */
export const updateLocationBadge = (location, runStartMinutes, dawnDate) => {
  const badge = document.getElementById("daylightWarning");
  if (!badge) return;

  const daylightCheck = checkDaylightNeeded(runStartMinutes, dawnDate);

  if (daylightCheck.needed) {
    badge.textContent = daylightCheck.message;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
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
