/**
 * Main App Module - Persistence
 * Save and load form values
 */

import { Storage } from '../../lib/storage.js';

/**
 * Load saved form values from storage
 * @param {object} elements - DOM elements
 * @param {object} state - Current state
 * @param {Function} syncTravelFn - Function to sync travel with location
 * @param {Function} setBreakfastFn - Function to set breakfast minutes
 * @returns {object} Updated state
 */
export const loadSavedValues = (
  elements,
  state,
  syncTravelFn,
  setBreakfastFn
) => {
  const saved = Storage.loadFormValues();
  let newState = { ...state };

  if (saved.firstMeeting && elements.firstMeeting) {
    elements.firstMeeting.value = saved.firstMeeting;
    newState.meeting = saved.firstMeeting;
  }

  if (saved.run && saved.run !== '0' && elements.runMinutes) {
    elements.runMinutes.value = saved.run;
    newState.runMinutes = parseInt(saved.run, 10) || 0;
  }

  const savedBreakfast = Number.parseInt(saved.breakfast, 10);
  const breakfastValue = Number.isFinite(savedBreakfast)
    ? savedBreakfast
    : state.breakfastMinutes;
  setBreakfastFn(breakfastValue);
  newState.breakfastMinutes = breakfastValue;

  if (saved.location && elements.runLocation) {
    elements.runLocation.value = saved.location;
    newState.location = saved.location;
    const syncedState = syncTravelFn(newState);
    newState = syncedState;
  }

  return newState;
};

/**
 * Save form values to storage
 * @param {object} state - Current state
 */
export const saveFormValues = (state) => {
  Storage.saveFormValues({
    firstMeeting: state.meeting,
    run: state.runMinutes,
    travel: state.travelMinutes,
    breakfast: state.breakfastMinutes,
    location: state.location,
  });
};
