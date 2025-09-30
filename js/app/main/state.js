/**
 * Main App Module - State Management
 * Application state initialization and management
 */

import { defaults } from '../../lib/constants.js';

/**
 * Create initial application state
 * @returns {object} Initial state
 */
export const createInitialState = () => ({
  meeting: defaults.firstMeeting,
  runMinutes: defaults.run,
  travelMinutes: defaults.travel,
  breakfastMinutes: defaults.breakfast,
  location: defaults.location,
});

/**
 * Update breakfast minutes in state
 * @param {object} state - Current state
 * @param {number} value - New breakfast minutes value
 * @returns {object} Updated state
 */
export const updateBreakfastMinutes = (state, value) => {
  const normalized = Number.isFinite(value) ? value : 0;
  return {
    ...state,
    breakfastMinutes: normalized,
  };
};

/**
 * Update location in state and sync travel time
 * @param {object} state - Current state
 * @param {string} location - New location value
 * @param {HTMLElement} runLocationEl - Run location select element
 * @returns {object} Updated state with synced travel time
 */
export const updateLocationWithTravel = (state, location, runLocationEl) => {
  const option = runLocationEl?.selectedOptions[0];
  const travel = option ? parseInt(option.dataset.travel, 10) || 0 : 0;

  return {
    ...state,
    location,
    travelMinutes: travel,
  };
};
