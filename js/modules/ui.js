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
 * Animate element with a brief highlight
 * @param {HTMLElement} element - Element to animate
 * @param {string} className - CSS class to add temporarily
 * @param {number} duration - Duration in milliseconds
 */
export const flashElement = (element, className = 'flash', duration = 300) => {
  if (!element) return;

  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
};

/**
 * Debounce function to limit function calls
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

/**
 * Safely set element text content
 * @param {string} selector - CSS selector
 * @param {string} text - Text to set
 */
export const setElementText = (selector, text) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
};

/**
 * Safely set element HTML content
 * @param {string} selector - CSS selector
 * @param {string} html - HTML to set
 */
export const setElementHTML = (selector, html) => {
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = html;
  }
};

/**
 * Add event listener with automatic cleanup tracking
 * @param {HTMLElement} element - Element to attach listener to
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {object} options - Event listener options
 */
export const addEventListenerWithCleanup = (
  element,
  event,
  handler,
  options = {}
) => {
  if (!element) return;

  element.addEventListener(event, handler, options);

  // Store cleanup function for potential future use
  if (!element._cleanupListeners) {
    element._cleanupListeners = [];
  }
  element._cleanupListeners.push(() => {
    element.removeEventListener(event, handler, options);
  });
};

/**
 * Show/hide element with optional animation
 * @param {HTMLElement} element - Element to show/hide
 * @param {boolean} show - True to show, false to hide
 * @param {boolean} animate - Whether to animate the change
 */
export const toggleElementVisibility = (element, show, animate = false) => {
  if (!element) return;

  if (animate) {
    if (show) {
      element.style.display = '';
      element.classList.remove('hidden');
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.3s ease';

      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });
    } else {
      element.style.transition = 'opacity 0.3s ease';
      element.style.opacity = '0';

      setTimeout(() => {
        element.classList.add('hidden');
        element.style.display = 'none';
      }, 300);
    }
  } else {
    if (show) {
      element.classList.remove('hidden');
      element.style.display = '';
    } else {
      element.classList.add('hidden');
    }
  }
};

/**
 * Format duration in minutes to human readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDurationDisplay = (minutes) => {
  if (minutes <= 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

/**
 * Validate numeric input and provide feedback
 * @param {HTMLInputElement} input - Input element
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if valid
 */
export const validateNumericInput = (input, min = 0, max = 999) => {
  if (!input) return false;

  const value = parseInt(input.value, 10);
  const isValid = !isNaN(value) && value >= min && value <= max;

  if (isValid) {
    input.classList.remove('input-error');
    input.setCustomValidity('');
  } else {
    input.classList.add('input-error');
    input.setCustomValidity(`Please enter a number between ${min} and ${max}`);
  }

  return isValid;
};

/**
 * Initialize tooltips for elements with title attributes
 */
export const initializeTooltips = () => {
  const elementsWithTitles = document.querySelectorAll('[title]');
  elementsWithTitles.forEach((element) => {
    // Add tooltip class for styling
    element.classList.add('has-tooltip');
  });
};

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.warn('Copy to clipboard failed:', error);
    return false;
  }
};
