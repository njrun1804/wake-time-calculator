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
    awarenessElements = {
      awCity: document.getElementById('awCity'),
      awDawn: document.getElementById('awDawn'),
      awMsg: document.getElementById('awMsg'),
      awWindChill: document.getElementById('awWindChill'),
      awPoP: document.getElementById('awPoP'),
      awWetBulb: document.getElementById('awWetBulb'),
      awWetness: document.getElementById('awWetness'),
      useLoc: document.getElementById('useMyLocation'),
      placeInput: document.getElementById('placeQuery'),
      setPlace: document.getElementById('setPlace'),
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
    } else {
      els.awCity.textContent = 'Verify location';
      els.awCity.classList.add('verification-needed');
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

  // Update surface conditions
  if (els.awWetness) {
    const wetnessInsight = interpretWetness(wetnessData);
    els.awWetness.textContent = wetnessInsight.label;
    const tooltip = wetnessInsight.detail || wetnessData?.summary;
    if (tooltip) {
      els.awWetness.title = tooltip;
    } else {
      els.awWetness.removeAttribute('title');
    }

    if (wetnessInsight.caution) {
      els.awMsg.textContent = wetnessInsight.caution;
    }

    // Surface latest insight for quick console inspection
    window.__latestWetnessInsight = wetnessInsight;
    window.__latestWetnessRaw = wetnessData;
  }

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
