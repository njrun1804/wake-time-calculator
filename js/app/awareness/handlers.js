/**
 * Awareness Module - Event Handlers
 * User interaction handlers for location and search
 */

import { Storage } from '../../lib/storage.js';
import { defaultTz } from '../../lib/constants.js';
import {
  getCurrentLocation,
  reverseGeocode,
  geocodePlace,
  validateCoordinates,
} from '../location.js';
import { cacheAwarenessElements } from './dom.js';
import { showAwarenessError } from './display.js';
import { refreshAwareness } from './core.js';
import { emitAwarenessEvent } from './events.js';

/**
 * Handle "Use my location" button click
 */
export const handleUseMyLocation = async () => {
  const els = cacheAwarenessElements();
  if (!els) return;

  try {
    if (!navigator.geolocation) {
      showAwarenessError('Geolocation not supported.');
      emitAwarenessEvent('location-error', {
        message: 'Geolocation not supported.',
      });
      return;
    }

    if (els.awMsg) els.awMsg.textContent = 'Getting location…';
    emitAwarenessEvent('location-requested');

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
      emitAwarenessEvent('location-updated', {
        city: label,
        lat: coords.lat,
        lon: coords.lon,
      });
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
      emitAwarenessEvent('location-updated', {
        city: fallback,
        lat: coords.lat,
        lon: coords.lon,
      });
    }
  } catch (error) {
    console.warn('Location access failed:', error);
    showAwarenessError('Location denied.');
    emitAwarenessEvent('location-denied', {
      message: error?.message || 'Location denied.',
    });
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
  emitAwarenessEvent('search-started', { query: trimmed });

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
    emitAwarenessEvent('search-error', { message });
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
  emitAwarenessEvent('location-updated', {
    city: location.city,
    lat: location.lat,
    lon: location.lon,
  });

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
    emitAwarenessEvent('init', { source: 'storage' });
    try {
      await refreshAwareness(saved.lat, saved.lon, saved.city, saved.tz);
      emitAwarenessEvent('ready', { source: 'storage' });
    } catch (error) {
      console.error('[Awareness] Failed to refresh from storage:', error);
      emitAwarenessEvent('error', { message: error.message });
      throw error;
    }
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
        emitAwarenessEvent('init', { source: 'geolocation' });
        await refreshAwareness(coords.lat, coords.lon, label, tz);
        emitAwarenessEvent('ready', { source: 'geolocation' });
      } catch (error) {
        console.warn('Silent reverse geocoding failed:', error);
        const fallback = `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;
        Storage.saveWeatherLocation({
          lat: coords.lat,
          lon: coords.lon,
          city: fallback,
          tz: defaultTz,
        });
        emitAwarenessEvent('init', { source: 'geolocation-fallback' });
        await refreshAwareness(coords.lat, coords.lon, fallback, defaultTz);
        emitAwarenessEvent('ready', { source: 'geolocation-fallback' });
      }
    } catch (error) {
      // Silent failure - don't show error message on startup
      console.log('Silent location detection failed:', error);
      emitAwarenessEvent('init', { source: 'geolocation-failed' });
    }
  } else {
    emitAwarenessEvent('init', { source: 'unsupported' });
    emitAwarenessEvent('ready', { source: 'unsupported' });
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
