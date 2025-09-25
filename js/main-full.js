/**
 * Wake Time Calculator - Full Modular Main Application
 * Orchestrates all modules including weather awareness
 */

import { calculateWakeTime, toMinutes } from './core/calculator.js';
import { Storage } from './core/storage.js';
import { defaults } from './core/constants.js';
import {
  initializeAwareness,
  setupAwarenessListeners,
  getCurrentDawn,
} from './modules/awareness.js';
import { updateLocationBadge, debounce } from './modules/ui.js';
import { runWhenIdle } from './utils/schedulers.js';

/**
 * Enhanced main application class with full modular functionality
 */
class FullWakeTimeApp {
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
   * Initialize the application
   */
  async init() {
    this.cacheElements();
    this.loadSavedValues();
    this.attachEventListeners();
    this.setupAwarenessFeatures();
    this.recalculate();

    // Initialize weather awareness lazily so first paint happens faster
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
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      form: document.getElementById('wakeForm'),
      firstMeeting: document.getElementById('firstMeeting'),
      runMinutes: document.getElementById('runMinutes'),
      runLocation: document.getElementById('runLocation'),
      travelMinutes: document.getElementById('travelMinutes'),
      breakfastMinutes: document.getElementById('breakfastMinutes'),

      // Output elements
      chosenWake: document.getElementById('chosenWake'),
      prevDayBadge: document.getElementById('prevDayBadge'),
      latestWake: document.getElementById('latestWake'),
      runStart: document.getElementById('runStart'),

      // Time bar elements
      runBar: document.getElementById('runBar'),
      runBarText: document.getElementById('runBarText'),
      prepBar: document.getElementById('prepBar'),
      travelBar: document.getElementById('travelBar'),
      travelBarText: document.getElementById('travelBarText'),
      breakfastBar: document.getElementById('breakfastBar'),
      breakfastBarText: document.getElementById('breakfastBarText'),
    };
  }

  /**
   * Load saved values from storage
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

    if (saved.breakfast && this.elements.breakfastMinutes) {
      this.elements.breakfastMinutes.value = saved.breakfast;
      this.state.breakfastMinutes = parseInt(saved.breakfast, 10) || 0;
    }

    if (saved.location && this.elements.runLocation) {
      this.elements.runLocation.value = saved.location;
      this.state.location = saved.location;
      this.syncTravelWithLocation();
    }
  }

  /**
   * Attach event listeners
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
    this.elements.breakfastMinutes?.addEventListener('change', () => {
      this.state.breakfastMinutes =
        parseInt(this.elements.breakfastMinutes.value, 10) || 0;
      this.saveAndRecalculate();
    });

    // Location change
    this.elements.runLocation?.addEventListener('change', () => {
      this.state.location = this.elements.runLocation.value;
      this.syncTravelWithLocation();
      this.saveAndRecalculate();
    });
  }

  /**
   * Setup weather awareness features
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
   * Update location headlamp warning based on dawn time
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
  }

  /**
   * Sync travel time with selected location
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
   * Save state and recalculate
   */
  saveAndRecalculate() {
    this.saveValues();
    this.debouncedRecalculate();
  }

  /**
   * Save values to storage
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
   * Recalculate and update display
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
   * Update the display with calculation results
   */
  updateDisplay(result) {
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

    if (this.elements.runStart) {
      this.elements.runStart.textContent = result.runStartTime12;
    }

    // Update time bars
    this.updateTimeBars(result);
  }

  /**
   * Update time allocation bars
   */
  updateTimeBars(result) {
    const total = result.totalMinutes || 1;
    const { run, travel, breakfast, prepBeforeRun } = result.durations;

    // Calculate percentages
    const runPct = (run / total) * 100;
    const travelPct = (travel / total) * 100;
    const breakfastPct = (breakfast / total) * 100;
    const prepPct = (prepBeforeRun / total) * 100;

    // Update run bar
    if (this.elements.runBar) {
      this.elements.runBar.style.flexBasis = `${runPct}%`;
      this.elements.runBar.style.display = run > 0 ? 'flex' : 'none';
      if (this.elements.runBarText && run > 0) {
        this.elements.runBarText.textContent = `Run ${run}m`;
      }
    }

    // Update travel bar
    if (this.elements.travelBar) {
      this.elements.travelBar.style.flexBasis = `${travelPct}%`;
      this.elements.travelBar.style.display = travel > 0 ? 'flex' : 'none';
      if (this.elements.travelBarText && travel > 0) {
        this.elements.travelBarText.textContent = `Travel ${travel}m`;
      }
    }

    // Update breakfast bar
    if (this.elements.breakfastBar) {
      this.elements.breakfastBar.style.flexBasis = `${breakfastPct}%`;
      this.elements.breakfastBar.style.display =
        breakfast > 0 ? 'flex' : 'none';
      if (this.elements.breakfastBarText && breakfast > 0) {
        this.elements.breakfastBarText.textContent = `Breakfast ${breakfast}m`;
      }
    }

    // Update prep bar
    if (this.elements.prepBar) {
      this.elements.prepBar.style.flexBasis = `${prepPct}%`;
    }
  }

  /**
   * Surface awareness initialization errors gracefully
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
    const app = new FullWakeTimeApp();
    await app.init();
  });
} else {
  const app = new FullWakeTimeApp();
  app.init();
}

// Export for testing
export { FullWakeTimeApp };
