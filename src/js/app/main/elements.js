/**
 * Main App Module - DOM Elements
 * DOM element caching utilities
 */

/**
 * Cache all DOM elements used by the application
 * @returns {object} Cached elements
 */
export const cacheElements = () => ({
  form: document.getElementById('wakeForm'),
  firstMeeting: document.getElementById('firstMeeting'),
  runMinutes: document.getElementById('runMinutes'),
  runLocation: document.getElementById('runLocation'),
  travelMinutes: document.getElementById('travelMinutes'),
  breakfastHidden: document.getElementById('breakfastMinutes'),
  breakfastOptions: Array.from(document.querySelectorAll('.breakfast-option')),

  // Output elements
  chosenWake: document.getElementById('chosenWake'),
  prevDayBadge: document.getElementById('prevDayBadge'),
  latestWake: document.getElementById('latestWake'),
});
