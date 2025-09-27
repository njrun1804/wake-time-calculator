/**
 * Wake Time Calculator - Main Application
 * Full modular experience with weather awareness.
 */

import { calculateWakeTime, toMinutes } from '../lib/calculator.js';
import { Storage } from '../lib/storage.js';
import { defaults } from '../lib/constants.js';
import {
  initializeAwareness,
  setupAwarenessListeners,
  getCurrentDawn,
  updateDawnStatus,
} from './awareness.js';
import { updateLocationBadge, debounce } from './ui.js';
import { runWhenIdle } from '../lib/schedulers.js';

/**
 * Main application orchestrator.
 */
class WakeTimeApp {
  constructor() {
    this.elements = {};
    this.state = {
      meeting: defaults.firstMeeting,
      runMinutes: defaults.run,
      travelMinutes: defaults.travel,
      breakfastMinutes: defaults.breakfast,
      location: defaults.location,
    };
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

    if (typeof window !== 'undefined') {
      window.__triggerAwarenessForTests = async () => {
        try {
          await initializeAwareness();
          this.awarenessReady = true;
          this.updateLocationHeadlamp();
        } catch (error) {
          this.handleAwarenessError(error);
        }
      };
    }

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
    this.elements = {
      form: document.getElementById('wakeForm'),
      firstMeeting: document.getElementById('firstMeeting'),
      runMinutes: document.getElementById('runMinutes'),
      runLocation: document.getElementById('runLocation'),
      travelMinutes: document.getElementById('travelMinutes'),
      breakfastHidden: document.getElementById('breakfastMinutes'),
      breakfastOptions: Array.from(
        document.querySelectorAll('.breakfast-option')
      ),

      // Output elements
      chosenWake: document.getElementById('chosenWake'),
      prevDayBadge: document.getElementById('prevDayBadge'),
      latestWake: document.getElementById('latestWake'),
    };
  }

  /**
   * Load saved values from storage to seed the form.
   */
  loadSavedValues() {
    const saved = Storage.loadFormValues();

    if (saved.firstMeeting && this.elements.firstMeeting) {
      this.elements.firstMeeting.value = saved.firstMeeting;
      this.state.meeting = saved.firstMeeting;
    }

    if (saved.run && saved.run !== '0' && this.elements.runMinutes) {
      this.elements.runMinutes.value = saved.run;
      this.state.runMinutes = parseInt(saved.run, 10) || 0;
    }

    const savedBreakfast = Number.parseInt(saved.breakfast, 10);
    const breakfastValue = Number.isFinite(savedBreakfast)
      ? savedBreakfast
      : this.state.breakfastMinutes;
    this.setBreakfastMinutes(breakfastValue);

    if (saved.location && this.elements.runLocation) {
      this.elements.runLocation.value = saved.location;
      this.state.location = saved.location;
      this.syncTravelWithLocation();
    }
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
      this.syncTravelWithLocation();
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
    if (!this.awarenessReady) return;

    const currentDawn = getCurrentDawn();
    if (!currentDawn) return;

    // Calculate run start time
    const result = calculateWakeTime({
      meeting: this.state.meeting,
      runMinutes: this.state.runMinutes,
      travelMinutes: this.state.travelMinutes,
      breakfastMinutes: this.state.breakfastMinutes,
    });

    const runStartMinutes = toMinutes(result.runStartTime);
    updateLocationBadge(this.state.location, runStartMinutes, currentDawn);
    updateDawnStatus(runStartMinutes, currentDawn);
  }

  /**
   * Sync hidden travel minutes with the selected location.
   */
  syncTravelWithLocation() {
    const option = this.elements.runLocation?.selectedOptions[0];
    if (option) {
      const travel = parseInt(option.dataset.travel, 10) || 0;
      this.state.travelMinutes = travel;
      if (this.elements.travelMinutes) {
        this.elements.travelMinutes.value = travel;
      }
    }
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
    Storage.saveFormValues({
      firstMeeting: this.state.meeting,
      run: this.state.runMinutes,
      travel: this.state.travelMinutes,
      breakfast: this.state.breakfastMinutes,
      location: this.state.location,
    });
  }

  /**
   * Recalculate schedule and refresh UI.
   */
  recalculate() {
    const result = calculateWakeTime({
      meeting: this.state.meeting,
      runMinutes: this.state.runMinutes,
      travelMinutes: this.state.travelMinutes,
      breakfastMinutes: this.state.breakfastMinutes,
    });

    this.updateDisplay(result);
    this.updateLocationHeadlamp();
  }

  /**
   * Update the displayed schedule outputs.
   */
  updateDisplay(result) {
    window.__latestSchedule = {
      ...result,
      runStartMinutes: toMinutes(result.runStartTime),
    };

    // Update wake time display
    if (this.elements.chosenWake) {
      this.elements.chosenWake.textContent = result.wakeTime12;
    }

    // Show/hide previous day badge
    if (this.elements.prevDayBadge) {
      if (result.previousDay) {
        this.elements.prevDayBadge.classList.remove('hidden');
      } else {
        this.elements.prevDayBadge.classList.add('hidden');
      }
    }

    // Update other time displays
    if (this.elements.latestWake) {
      this.elements.latestWake.textContent = result.latestWakeTime12;
    }
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    const app = new WakeTimeApp();
    await app.init();
  });
} else {
  const app = new WakeTimeApp();
  app.init();
}

// Export for testing
export { WakeTimeApp };
