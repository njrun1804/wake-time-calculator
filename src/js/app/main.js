/**
 * Main App Module - Consolidated
 *
 * This is the main application orchestrator that:
 * - Initializes the wake time calculator app
 * - Manages application state (meeting time, run duration, breakfast, location)
 * - Handles form interactions and user input
 * - Coordinates between calculator, awareness, and UI modules
 * - Persists form values to localStorage
 *
 * Data Flow:
 * 1. init → loads saved values, sets up listeners
 * 2. User input → updates state → saveAndRecalculate
 * 3. recalculate → calculateWakeTime → updateDisplay
 * 4. Awareness ready → updateLocationHeadlamp → dawn warning badges
 *
 * Application Lifecycle:
 * 1. DOM ready → WakeTimeApp constructor
 * 2. init() → cache elements, load saved values, attach listeners
 * 3. recalculate() → initial wake time display
 * 4. runWhenIdle → initializeAwareness (deferred for fast first paint)
 * 5. awarenessReady = true → enable dawn warnings
 *
 * State Management:
 * - State is immutable (new objects created on updates)
 * - Changes trigger saveAndRecalculate → persist + recalculate
 * - Debounced recalculation (150ms) for smooth UX during typing
 *
 * Module Responsibilities:
 * - main.js: App orchestration, state, lifecycle
 * - calculator.js (lib): Pure wake time calculations
 * - awareness.js: Weather data fetching and display
 * - ui.js: UI utilities (debounce, location badges)
 */

// External dependencies
import { defaults } from "../lib/constants.js";
import { Storage } from "../lib/storage.js";
import { calculateWakeTime, toMinutes } from "../lib/calculator.js";
import { runWhenIdle } from "../lib/schedulers.js";
import { updateLocationBadge, debounce } from "./ui.js";
import {
  initializeAwareness,
  setupAwarenessListeners,
  getCurrentDawn,
  updateDawnStatus,
} from "./awareness.js";

// ============================================================================
// DOM ELEMENTS
// ============================================================================

/**
 * Cache all DOM elements used by the application
 * @returns {object} Cached elements
 */
export const cacheElements = () => ({
  form: document.getElementById("wakeForm"),
  firstMeeting: document.getElementById("firstMeeting"),
  runMinutes: document.getElementById("runMinutes"),
  runLocation: document.getElementById("runLocation"),
  travelMinutes: document.getElementById("travelMinutes"),
  breakfastHidden: document.getElementById("breakfastMinutes"),
  breakfastOptions: Array.from(document.querySelectorAll(".breakfast-option")),

  // Output elements
  chosenWake: document.getElementById("chosenWake"),
  prevDayBadge: document.getElementById("prevDayBadge"),
  latestWake: document.getElementById("latestWake"),
});

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

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
 *
 * Reads travel time from the selected option's data-travel attribute.
 * This allows each location to have a pre-configured travel time.
 *
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

// ============================================================================
// CALCULATOR INTEGRATION
// ============================================================================

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
 *
 * Updates UI elements with calculated times and shows/hides
 * the "previous day" badge if wake time rolls over midnight.
 *
 * @param {object} elements - DOM elements
 * @param {object} result - Calculation result from calculateWakeTime
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
      elements.prevDayBadge.classList.remove("hidden");
    } else {
      elements.prevDayBadge.classList.add("hidden");
    }
  }

  // Update other time displays
  if (elements.latestWake) {
    elements.latestWake.textContent = result.latestWakeTime12;
  }
};

/**
 * Update location headlamp/daylight warnings
 *
 * Checks if the run start time is before dawn and updates:
 * - Location badge with headlamp warning
 * - Dawn status icon in awareness panel
 *
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

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Load saved form values from storage
 *
 * Restores form state from previous session, including:
 * - Meeting time
 * - Run duration
 * - Breakfast option
 * - Location (with synced travel time)
 *
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
  setBreakfastFn,
) => {
  const saved = Storage.loadFormValues();
  let newState = { ...state };

  if (saved.firstMeeting && elements.firstMeeting) {
    elements.firstMeeting.value = saved.firstMeeting;
    newState.meeting = saved.firstMeeting;
  }

  if (saved.run && saved.run !== "0" && elements.runMinutes) {
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

// ============================================================================
// APPLICATION CLASS
// ============================================================================

/**
 * Main application orchestrator.
 *
 * Coordinates all app modules and manages the application lifecycle:
 * - Initializes awareness (weather) module lazily
 * - Caches DOM elements for performance
 * - Loads saved values from localStorage
 * - Attaches event listeners to form inputs
 * - Recalculates wake times on input changes
 * - Updates daylight warnings based on dawn time
 */
export class WakeTimeApp {
  constructor() {
    this.elements = {};
    this.state = createInitialState();
    this.debouncedRecalculate = debounce(() => this.recalculate(), 150);
    this.awarenessReady = false;
  }

  /**
   * Initialize the application.
   */
  async init() {
    this.cacheElements();
    this.loadSavedValues();
    this.attachEventListeners();
    this.setupAwarenessFeatures();
    this.recalculate();

    // Initialize weather awareness lazily so first paint happens faster.
    runWhenIdle(async () => {
      try {
        await initializeAwareness();
        this.awarenessReady = true;
        this.updateLocationHeadlamp();
      } catch (error) {
        this.handleAwarenessError(error);
      }
    });
  }

  /**
   * Cache DOM elements that we manipulate frequently.
   */
  cacheElements() {
    this.elements = cacheElements();
  }

  /**
   * Load saved values from storage to seed the form.
   */
  loadSavedValues() {
    this.state = loadSavedValues(
      this.elements,
      this.state,
      (state) => this.syncTravelWithLocation(state),
      (value) => this.setBreakfastMinutes(value),
    );
  }

  /**
   * Bind UI event listeners.
   */
  attachEventListeners() {
    // Prevent form submission
    this.elements.form?.addEventListener("submit", (e) => {
      e.preventDefault();
    });

    // Meeting time change
    this.elements.firstMeeting?.addEventListener("change", () => {
      this.state.meeting = this.elements.firstMeeting.value;
      this.saveAndRecalculate();
    });

    // Run minutes change
    this.elements.runMinutes?.addEventListener("input", () => {
      const value = parseInt(this.elements.runMinutes.value, 10) || 0;
      this.state.runMinutes = Math.max(0, Math.min(999, value));
      this.saveAndRecalculate();
    });

    // Breakfast change
    if (Array.isArray(this.elements.breakfastOptions)) {
      this.elements.breakfastOptions.forEach((input) => {
        input.addEventListener("change", () => {
          if (!input.checked) return;
          const value = Number.parseInt(input.value, 10) || 0;
          this.setBreakfastMinutes(value);
          this.saveAndRecalculate();
        });
      });
    }

    // Location change
    this.elements.runLocation?.addEventListener("change", () => {
      this.state.location = this.elements.runLocation.value;
      this.state = this.syncTravelWithLocation(this.state);
      this.saveAndRecalculate();
    });
  }

  /**
   * Hook up weather awareness interactions.
   */
  setupAwarenessFeatures() {
    setupAwarenessListeners();

    // Setup daylight check function for global access
    window.updateLocationHeadlamp = () => {
      this.updateLocationHeadlamp();
    };

    // Add test dawn function for debugging
    window.setTestDawn = (hours, minutes) => {
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      window.currentDawnDate = date;
      this.updateLocationHeadlamp();
    };
  }

  /**
   * Update the dirt trail warning based on dawn timing.
   */
  updateLocationHeadlamp() {
    updateLocationHeadlamp(this.state, this.awarenessReady);
  }

  /**
   * Sync hidden travel minutes with the selected location.
   * @param {object} state - Current state
   * @returns {object} Updated state
   */
  syncTravelWithLocation(state) {
    const newState = updateLocationWithTravel(
      state,
      state.location,
      this.elements.runLocation,
    );

    if (this.elements.travelMinutes) {
      this.elements.travelMinutes.value = newState.travelMinutes;
    }

    return newState;
  }

  /**
   * Update breakfast minutes state and toggle selection.
   * @param {number} value - Minutes to allocate for breakfast
   */
  setBreakfastMinutes(value) {
    const normalized = Number.isFinite(value) ? value : 0;
    this.state.breakfastMinutes = normalized;
    if (this.elements.breakfastHidden) {
      this.elements.breakfastHidden.value = normalized;
    }
    if (Array.isArray(this.elements.breakfastOptions)) {
      this.elements.breakfastOptions.forEach((input) => {
        input.checked = Number.parseInt(input.value, 10) === normalized;
      });
    }
  }

  /**
   * Persist state and trigger recalculation.
   */
  saveAndRecalculate() {
    this.saveValues();
    this.debouncedRecalculate();
  }

  /**
   * Persist form state for the next visit.
   */
  saveValues() {
    saveFormValues(this.state);
  }

  /**
   * Recalculate schedule and refresh UI.
   */
  recalculate() {
    const result = recalculateSchedule(this.state);
    updateDisplay(this.elements, result);
    this.updateLocationHeadlamp();
  }

  /**
   * Surface awareness initialization errors gracefully.
   */
  handleAwarenessError(error) {
    console.error("Failed to initialize awareness module", error);

    this.awarenessReady = true;

    const status = document.getElementById("awMsg");
    if (status && status.textContent?.trim() === "—") {
      status.textContent = "Weather data unavailable";
    }

    const verifyButton = document.getElementById("awCity");
    verifyButton?.classList.remove("verification-needed");
    verifyButton?.classList.add("btn-disabled");
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    const app = new WakeTimeApp();
    await app.init();
  });
} else {
  const app = new WakeTimeApp();
  app.init();
}
