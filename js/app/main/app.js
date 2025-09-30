/**
 * Main App Module - Application Class
 * Main application orchestrator
 */

import {
  initializeAwareness,
  setupAwarenessListeners,
} from '../awareness/index.js';
import { debounce } from '../ui.js';
import { runWhenIdle } from '../../lib/schedulers.js';
import { createInitialState, updateLocationWithTravel } from './state.js';
import { cacheElements } from './elements.js';
import { loadSavedValues, saveFormValues } from './persistence.js';
import {
  recalculateSchedule,
  updateDisplay,
  updateLocationHeadlamp,
} from './calculator.js';

/**
 * Main application orchestrator.
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
      (value) => this.setBreakfastMinutes(value)
    );
  }

  /**
   * Bind UI event listeners.
   */
  attachEventListeners() {
    // Prevent form submission
    this.elements.form?.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    // Meeting time change
    this.elements.firstMeeting?.addEventListener('change', () => {
      this.state.meeting = this.elements.firstMeeting.value;
      this.saveAndRecalculate();
    });

    // Run minutes change
    this.elements.runMinutes?.addEventListener('input', () => {
      const value = parseInt(this.elements.runMinutes.value, 10) || 0;
      this.state.runMinutes = Math.max(0, Math.min(999, value));
      this.saveAndRecalculate();
    });

    // Breakfast change
    if (Array.isArray(this.elements.breakfastOptions)) {
      this.elements.breakfastOptions.forEach((input) => {
        input.addEventListener('change', () => {
          if (!input.checked) return;
          const value = Number.parseInt(input.value, 10) || 0;
          this.setBreakfastMinutes(value);
          this.saveAndRecalculate();
        });
      });
    }

    // Location change
    this.elements.runLocation?.addEventListener('change', () => {
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
      this.elements.runLocation
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
    console.error('Failed to initialize awareness module', error);

    this.awarenessReady = true;

    const status = document.getElementById('awMsg');
    if (status && status.textContent?.trim() === '—') {
      status.textContent = 'Weather data unavailable';
    }

    const verifyButton = document.getElementById('awCity');
    verifyButton?.classList.remove('verification-needed');
    verifyButton?.classList.add('btn-disabled');
  }
}
