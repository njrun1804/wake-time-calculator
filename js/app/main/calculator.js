/**
 * Main App Module - Calculator Integration
 * Wake time calculation and display logic
 */

import { calculateWakeTime, toMinutes } from '../../lib/calculator.js';
import { updateLocationBadge } from '../ui.js';
import { getCurrentDawn, updateDawnStatus } from '../awareness/index.js';

/**
 * Recalculate schedule from state
 * @param {object} state - Current state
 * @returns {object} Calculation result
 */
export const recalculateSchedule = (state) => {
  return calculateWakeTime({
    meeting: state.meeting,
    runMinutes: state.runMinutes,
    travelMinutes: state.travelMinutes,
    breakfastMinutes: state.breakfastMinutes,
  });
};

/**
 * Update display with calculation result
 * @param {object} elements - DOM elements
 * @param {object} result - Calculation result
 */
export const updateDisplay = (elements, result) => {
  window.__latestSchedule = {
    ...result,
    runStartMinutes: toMinutes(result.runStartTime),
  };

  // Update wake time display
  if (elements.chosenWake) {
    elements.chosenWake.textContent = result.wakeTime12;
  }

  // Show/hide previous day badge
  if (elements.prevDayBadge) {
    if (result.previousDay) {
      elements.prevDayBadge.classList.remove('hidden');
    } else {
      elements.prevDayBadge.classList.add('hidden');
    }
  }

  // Update other time displays
  if (elements.latestWake) {
    elements.latestWake.textContent = result.latestWakeTime12;
  }
};

/**
 * Update location headlamp/daylight warnings
 * @param {object} state - Current state
 * @param {boolean} awarenessReady - Whether awareness is ready
 */
export const updateLocationHeadlamp = (state, awarenessReady) => {
  if (!awarenessReady) return;

  const currentDawn = getCurrentDawn();
  if (!currentDawn) return;

  // Calculate run start time
  const result = recalculateSchedule(state);
  const runStartMinutes = toMinutes(result.runStartTime);

  updateLocationBadge(state.location, runStartMinutes, currentDawn);
  updateDawnStatus(runStartMinutes, currentDawn);
};
