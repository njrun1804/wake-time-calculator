/**
 * Location Module - Barrel Export
 * Maintains backward compatibility with existing imports
 */

export { validateCoordinates } from './validation.js';
export { getCurrentLocation } from './geolocation.js';
export { geocodePlace, reverseGeocode } from './geocoding.js';
