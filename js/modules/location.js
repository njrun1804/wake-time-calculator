/**
 * Wake Time Calculator - Location Module
 * Handles geocoding, location detection, and coordinate management
 */

import { defaultTz } from '../core/constants.js';

/**
 * Format a place name from geocoding data
 * @param {object} place - Place data from geocoding API
 * @returns {string} Formatted place name
 */
const formatPlaceName = (place) => {
  const { name, admin1, country } = place;
  return name || admin1 || country || 'Location';
};

/**
 * Geocode a place name to coordinates
 * @param {string} name - Place name to geocode
 * @returns {Promise<object>} Location data with lat, lon, city, tz
 */
export const geocodePlace = async (name) => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('geocoding failed');

  const data = await res.json();
  if (!data.results?.[0]) throw new Error('no results');

  const place = data.results[0];
  return {
    lat: place.latitude,
    lon: place.longitude,
    city: formatPlaceName(place),
    tz: place.timezone || defaultTz
  };
};

/**
 * Reverse geocode coordinates to place name
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Location data with city name
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    // Try Open-Meteo reverse geocoding first
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1&format=json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]) {
          const place = data.results[0];
          return {
            city: formatPlaceName(place),
            tz: place.timezone || defaultTz
          };
        }
      }
    } catch (error) {
      console.warn('Open-Meteo reverse geocoding failed:', error);
    }

    // Fallback to Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',').map(s => s.trim());
          const city = parts[0] || parts[1] || 'Location';
          return { city, tz: defaultTz };
        }
      }
    } catch (error) {
      console.warn('Nominatim reverse geocoding failed:', error);
    }
  } catch (error) {
    console.warn('All reverse geocoding methods failed:', error);
  }

  // Ultimate fallback
  return { city: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
};

/**
 * Get current location using browser geolocation
 * @returns {Promise<object>} Location data with lat, lon
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lon: longitude });
      },
      (error) => {
        let message = 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export const validateCoordinates = (lat, lon) => {
  return Number.isFinite(lat) && Number.isFinite(lon) &&
         lat >= -90 && lat <= 90 &&
         lon >= -180 && lon <= 180;
};