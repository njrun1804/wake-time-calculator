/**
 * Awareness Module - Display Logic
 * UI update and display management
 */

import { defaultTz } from '../../lib/constants.js';
import { fmtTime12InZone } from '../../lib/time.js';
import { toMinutes } from '../../lib/calculator.js';
import { interpretWetness, formatTemp, formatPoP } from '../weather.js';
import { cacheAwarenessElements } from './dom.js';
import {
  setStatusIcon,
  computeDawnStatus,
  computeWindStatus,
  computePrecipStatus,
  computeWetBulbStatus,
} from './status.js';
import { emitAwarenessEvent } from './events.js';

/**
 * Current dawn date (global state for daylight checking)
 */
let currentDawnDate = null;

/**
 * Update dawn status icon
 * @param {number} runStartMinutes - Run start time in minutes
 * @param {Date} dawnDate - Dawn date
 */
export const updateDawnStatus = (runStartMinutes, dawnDate) => {
  const els = cacheAwarenessElements();
  if (!els?.awDawnIcon) return;
  const status = computeDawnStatus(runStartMinutes, dawnDate);
  setStatusIcon(els.awDawnIcon, status);
};

/**
 * Update awareness display with weather and location data
 * @param {object} data - Weather and location data
 * @returns {object} Display result
 */
export const updateAwarenessDisplay = (data) => {
  const els = cacheAwarenessElements();
  if (!els) return {};

  const { city, dawn, windChillF, pop, wetBulbF, wetnessData, tz } = data;

  // Update city display
  if (els.awCity) {
    if (city) {
      els.awCity.textContent = city;
      els.awCity.classList.remove('verification-needed');
      els.awCity.classList.add('location-verified');
    } else {
      els.awCity.textContent = 'Verify location';
      els.awCity.classList.add('verification-needed');
      els.awCity.classList.remove('location-verified');
    }
  }

  // Update dawn time
  if (els.awDawn) {
    if (dawn) {
      els.awDawn.textContent = fmtTime12InZone(dawn, tz || defaultTz);
      els.awDawn.setAttribute('datetime', dawn.toISOString());
      els.awDawn.title = `Around dawn local time (${tz || defaultTz})`;
    } else {
      els.awDawn.textContent = '—';
      els.awDawn.removeAttribute('datetime');
      els.awDawn.removeAttribute('title');
    }
  }

  // Update weather data
  if (els.awWindChill) els.awWindChill.textContent = formatTemp(windChillF);
  if (els.awWetBulb) els.awWetBulb.textContent = formatTemp(wetBulbF);
  if (els.awPoP) {
    els.awPoP.textContent = formatPoP(pop);
    els.awPoP.title = 'Probability of precip for the hour around dawn';
  }

  let wetnessInsight = null;
  let decision = null;

  const hasWetnessUi =
    els.awWetness || els.awDecisionText || els.awDecisionIcon || els.awMsg;
  if (hasWetnessUi) {
    wetnessInsight = interpretWetness(wetnessData);

    if (els.awWetness) {
      const tooltip = wetnessInsight.detail || wetnessData?.summary;
      if (tooltip) {
        els.awWetness.title = tooltip;
      } else {
        els.awWetness.removeAttribute('title');
      }
    }

    decision = wetnessInsight.decision || 'OK';
    if (els.awDecisionText) {
      const labelText = wetnessInsight.label || '—';
      els.awDecisionText.textContent = labelText;
    }
    if (els.awDecisionIcon) {
      const decisionStatus =
        decision === 'Avoid'
          ? 'warning'
          : decision === 'Caution'
            ? 'yield'
            : 'ok';
      setStatusIcon(els.awDecisionIcon, decisionStatus);
    }

    if (els.awMsg) {
      els.awMsg.textContent = '';
      els.awMsg.classList.add('hidden');
    }

    // Surface latest insight for quick console inspection
    window.__latestWetnessInsight = wetnessInsight;
    window.__latestWetnessRaw = wetnessData;

    // Log for test debugging
    if (typeof window !== 'undefined' && window.__awarenessMock) {
      console.log('[Awareness] Wetness insight calculated:', wetnessInsight);
    }
  }

  const schedule = window.__latestSchedule;
  const scheduleStart = schedule
    ? (schedule.runStartMinutes ?? toMinutes(schedule.runStartTime))
    : null;
  const runStartMinutes = Number.isFinite(scheduleStart) ? scheduleStart : null;

  const dawnStatus = computeDawnStatus(runStartMinutes, dawn);
  const windStatus = computeWindStatus(windChillF);
  const precipStatus = computePrecipStatus(pop);
  const wetBulbStatus = computeWetBulbStatus(wetBulbF);

  setStatusIcon(els.awDawnIcon, dawnStatus);
  setStatusIcon(els.awWindChillIcon, windStatus);
  setStatusIcon(els.awPoPIcon, precipStatus);
  setStatusIcon(els.awWetBulbIcon, wetBulbStatus);

  // Store dawn for daylight check
  currentDawnDate = dawn;

  // Trigger daylight check update if function exists
  if (typeof window.updateLocationHeadlamp === 'function') {
    window.updateLocationHeadlamp();
  }

  updateDawnStatus(runStartMinutes, dawn);

  return {
    wetnessInsight,
    decision,
    city,
    dawn,
    runStartMinutes,
    timezone: tz,
  };
};

/**
 * Show error message in awareness UI
 * @param {string} message - Error message to display
 */
export const showAwarenessError = (message) => {
  const els = cacheAwarenessElements();
  if (els?.awMsg) {
    els.awMsg.textContent = message;
    els.awMsg.classList.remove('hidden');
  }
  setStatusIcon(els?.awDawnIcon, 'none');
  setStatusIcon(els?.awWindChillIcon, 'none');
  setStatusIcon(els?.awPoPIcon, 'none');
  setStatusIcon(els?.awWetBulbIcon, 'none');
  if (els?.awDecisionIcon) {
    setStatusIcon(els.awDecisionIcon, 'none');
  }
  if (els?.awDecisionText) {
    els.awDecisionText.textContent = '—';
  }
  emitAwarenessEvent('error', { message });
};

/**
 * Get current dawn date (for external access)
 * @returns {Date|null} Current dawn date
 */
export const getCurrentDawn = () => currentDawnDate;

/**
 * Set current dawn date (for testing)
 * @param {Date} date - Dawn date to set
 */
export const setCurrentDawn = (date) => {
  currentDawnDate = date;
  if (typeof window.updateLocationHeadlamp === 'function') {
    window.updateLocationHeadlamp();
  }
};
