/**
 * Wake Time Calculator - Awareness Module
 * Handles weather awareness display and UI updates
 */

import { Storage } from '../lib/storage.js';
import { defaultTz } from '../lib/constants.js';
import { fmtTime12InZone } from '../lib/time.js';
import {
  fetchWeatherAround,
  fetchWetnessInputs,
  interpretWetness,
  formatTemp,
  formatPoP,
} from './weather.js';
import { fetchDawn } from './dawn.js';
import {
  getCurrentLocation,
  reverseGeocode,
  geocodePlace,
  validateCoordinates,
} from './location.js';
import { toMinutes } from '../lib/calculator.js';

const setStatusIcon = (iconEl, status) => {
  if (!iconEl) return;
  iconEl.classList.add('hidden');
  iconEl.classList.remove('icon-ok', 'icon-yield', 'icon-warning');
  if (status === 'ok') {
    iconEl.textContent = '✅';
    iconEl.classList.remove('hidden');
    iconEl.classList.add('icon-ok');
  } else if (status === 'yield') {
    iconEl.textContent = '⚠';
    iconEl.classList.remove('hidden');
    iconEl.classList.add('icon-yield');
  } else if (status === 'warning') {
    iconEl.textContent = '⛔';
    iconEl.classList.remove('hidden');
    iconEl.classList.add('icon-warning');
  }
};

/**
 * Weather awareness UI elements cache
 */
let awarenessElements = null;

/**
 * Current dawn date (global state for daylight checking)
 */
let currentDawnDate = null;

/**
 * Cache DOM elements for awareness UI
 */
const cacheAwarenessElements = () => {
  if (!awarenessElements) {
    const awMsgEl = document.getElementById('awMsg');
    awarenessElements = {
      awCity: document.getElementById('awCity'),
      awDawn: document.getElementById('awDawn'),
      awMsg: awMsgEl,
      awWindChill: document.getElementById('awWindChill'),
      awPoP: document.getElementById('awPoP'),
      awWetBulb: document.getElementById('awWetBulb'),
      awDawnIcon: document.getElementById('awDawnIcon'),
      awWindChillIcon: document.getElementById('awWindChillIcon'),
      awPoPIcon: document.getElementById('awPoPIcon'),
      awWetBulbIcon: document.getElementById('awWetBulbIcon'),
      awWetness: document.getElementById('awWetness'),
      awDecisionIcon: document.getElementById('awDecisionIcon'),
      awDecisionText: document.getElementById('awDecisionText'),
      useLoc: document.getElementById('useMyLocation'),
      placeInput: document.getElementById('placeQuery'),
      setPlace: document.getElementById('setPlace'),
      defaultMsg: awMsgEl ? awMsgEl.textContent : '',
    };
  }
  return awarenessElements;
};

/**
 * Update awareness display with weather and location data
 * @param {object} data - Weather and location data
 */
const updateAwarenessDisplay = (data) => {
  const els = cacheAwarenessElements();
  if (!els) return;

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

  const hasWetnessUi =
    els.awWetness || els.awDecisionText || els.awDecisionIcon || els.awMsg;
  if (hasWetnessUi) {
    const wetnessInsight = interpretWetness(wetnessData);

    if (els.awWetness) {
      const tooltip = wetnessInsight.detail || wetnessData?.summary;
      if (tooltip) {
        els.awWetness.title = tooltip;
      } else {
        els.awWetness.removeAttribute('title');
      }
    }

    const decision = wetnessInsight.decision || 'OK';
    const displayDecision =
      decision === 'Avoid' ? 'Alert' : decision === 'OK' ? 'OK' : 'Caution';

    if (els.awDecisionText) {
      els.awDecisionText.textContent = displayDecision;
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
  }

  const schedule = window.__latestSchedule;
  const runStartMinutes = schedule
    ? (schedule.runStartMinutes ?? toMinutes(schedule.runStartTime))
    : null;
  const dawnMinutes = dawn ? dawn.getHours() * 60 + dawn.getMinutes() : null;

  let dawnStatus = 'ok';
  if (dawnMinutes !== null && typeof runStartMinutes === 'number') {
    const diff = runStartMinutes - dawnMinutes;
    if (diff <= 5 && diff >= -5) {
      dawnStatus = 'yield';
    } else if (diff < -5) {
      dawnStatus = 'warning';
    }
  }

  const windStatus =
    typeof windChillF === 'number'
      ? windChillF <= 30
        ? 'warning'
        : windChillF <= 40
          ? 'yield'
          : 'ok'
      : 'ok';

  const precipStatus =
    typeof pop === 'number'
      ? pop >= 60
        ? 'warning'
        : pop >= 30
          ? 'yield'
          : 'ok'
      : 'ok';

  const wetBulbStatus =
    typeof wetBulbF === 'number'
      ? wetBulbF >= 75
        ? 'warning'
        : wetBulbF >= 65
          ? 'yield'
          : 'ok'
      : 'ok';

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
};

/**
 * Show error message in awareness UI
 * @param {string} message - Error message to display
 */
const showAwarenessError = (message) => {
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
};

/**
 * Refresh weather awareness data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} city - City name (optional)
 * @param {string} tz - Timezone (optional)
 */
export const refreshAwareness = async (lat, lon, city = '', tz = defaultTz) => {
  try {
    const controller = new AbortController();
    const signal = controller.signal;

    // Timeout after 10 seconds
    setTimeout(() => controller.abort(), 10000);

    // Fetch dawn first
    const dawnDate = await fetchDawn(lat, lon, tz, signal);

    // Parallel fetch weather & wetness
    const [weather, wetnessInfo] = await Promise.all([
      fetchWeatherAround(lat, lon, dawnDate, tz),
      fetchWetnessInputs(lat, lon, dawnDate, tz),
    ]);

    // Update display with all data
    updateAwarenessDisplay({
      city: city || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      dawn: dawnDate,
      windChillF: weather.windChillF,
      pop: weather.pop,
      wetBulbF: weather.wetBulbF,
      tempF: weather.tempF,
      windMph: weather.windMph,
      weatherCode: weather.weatherCode,
      snowfall: weather.snowfall,
      isSnow: weather.isSnow,
      wetnessData: wetnessInfo,
      tz,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      showAwarenessError('Request timed out');
    } else {
      console.warn('Awareness refresh failed:', error);
      showAwarenessError('Unable to load weather data');
    }
  }
};

/**
 * Handle "Use my location" button click
 */
export const handleUseMyLocation = async () => {
  const els = cacheAwarenessElements();
  if (!els) return;

  try {
    if (!navigator.geolocation) {
      showAwarenessError('Geolocation not supported.');
      return;
    }

    if (els.awMsg) els.awMsg.textContent = 'Getting location…';

    const coords = await getCurrentLocation();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const info = await reverseGeocode(coords.lat, coords.lon);
      const label =
        info.city || `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;

      Storage.saveWeatherLocation({
        lat: coords.lat,
        lon: coords.lon,
        city: label,
        tz,
      });
      await refreshAwareness(coords.lat, coords.lon, label, tz);
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      const fallback = `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;
      Storage.saveWeatherLocation({
        lat: coords.lat,
        lon: coords.lon,
        city: fallback,
        tz: defaultTz,
      });
      await refreshAwareness(coords.lat, coords.lon, fallback, defaultTz);
    }
  } catch (error) {
    console.warn('Location access failed:', error);
    showAwarenessError('Location denied.');
  }
};

/**
 * Handle location search
 * @param {string} query - Search query
 */
export const handleLocationSearch = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed) return;

  showAwarenessError('Searching…');

  let location;
  try {
    location = await geocodePlace(trimmed);
  } catch (error) {
    console.warn('Location search failed:', error);
    const message =
      error?.message === 'no results'
        ? 'Location not found'
        : 'Unable to search location';
    showAwarenessError(message);
    return;
  }

  Storage.saveWeatherLocation({
    lat: location.lat,
    lon: location.lon,
    city: location.city,
    tz: location.tz,
  });

  await refreshAwareness(
    location.lat,
    location.lon,
    location.city,
    location.tz
  );

  const els = cacheAwarenessElements();
  if (els?.placeInput) {
    els.placeInput.value = '';
  }
};

/**
 * Initialize awareness on app startup
 */
export const initializeAwareness = async () => {
  const saved = Storage.loadWeatherLocation();

  if (saved && validateCoordinates(saved.lat, saved.lon)) {
    // Use saved location
    await refreshAwareness(saved.lat, saved.lon, saved.city, saved.tz);
  } else if (navigator.geolocation) {
    // Try to get current location silently
    try {
      const coords = await getCurrentLocation();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      try {
        const info = await reverseGeocode(coords.lat, coords.lon);
        const label =
          info.city || `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;

        Storage.saveWeatherLocation({
          lat: coords.lat,
          lon: coords.lon,
          city: label,
          tz,
        });
        await refreshAwareness(coords.lat, coords.lon, label, tz);
      } catch (error) {
        console.warn('Silent reverse geocoding failed:', error);
        const fallback = `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;
        Storage.saveWeatherLocation({
          lat: coords.lat,
          lon: coords.lon,
          city: fallback,
          tz: defaultTz,
        });
        await refreshAwareness(coords.lat, coords.lon, fallback, defaultTz);
      }
    } catch (error) {
      // Silent failure - don't show error message on startup
      console.log('Silent location detection failed:', error);
    }
  }
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

/**
 * Setup awareness event listeners
 */
export const setupAwarenessListeners = () => {
  const els = cacheAwarenessElements();
  if (!els) return;

  // Use my location button
  if (els.useLoc) {
    els.useLoc.addEventListener('click', handleUseMyLocation);
  }

  // Location search
  if (els.placeInput) {
    els.placeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLocationSearch(els.placeInput.value);
      }
    });
  }

  if (els.setPlace) {
    els.setPlace.addEventListener('click', () => {
      handleLocationSearch(els.placeInput?.value);
    });
  }
};
