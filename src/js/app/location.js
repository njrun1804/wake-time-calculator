/**
 * Location Module - Consolidated
 *
 * This module handles all location-related functionality:
 * - Browser geolocation API integration
 * - Forward geocoding (place name → coordinates)
 * - Reverse geocoding (coordinates → place name)
 * - Coordinate validation
 *
 * Data Flow:
 * 1. getCurrentLocation → browser geolocation API → {lat, lon}
 * 2. geocodePlace → Open-Meteo Geocoding API → {lat, lon, city, tz}
 * 3. reverseGeocode → Open-Meteo/Nominatim APIs → {city, tz}
 * 4. validateCoordinates → validation checks → boolean
 */

// External dependencies
import { defaultTz } from "../lib/constants.js";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * US State abbreviations for formatting location names
 */
const US_STATE_ABBR = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export const validateCoordinates = (lat, lon) => {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};

// ============================================================================
// GEOLOCATION
// ============================================================================

/**
 * Get current location using browser geolocation
 *
 * Wraps the browser's Geolocation API in a Promise.
 * Uses low accuracy for faster results (enableHighAccuracy: false).
 * Caches position for up to 1 minute (user shouldn't travel far in that time).
 *
 * @returns {Promise<object>} Location data with lat, lon
 * @throws {Error} If geolocation is unsupported or permission denied
 *
 * @example
 * try {
 *   const { lat, lon } = await getCurrentLocation();
 *   console.log(`You are at ${lat}, ${lon}`);
 * } catch (error) {
 *   console.error('Location access denied:', error.message);
 * }
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lon: longitude });
      },
      (error) => {
        let message = "Location access denied";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false, // Low accuracy for faster results
        timeout: 10000, // 10 second timeout
        maximumAge: 60000, // 1 minute cache (was 5 min - too long)
      },
    );
  });
};

// ============================================================================
// GEOCODING
// ============================================================================

/**
 * Remove duplicate parts from array
 * @param {Array<string>} parts - Array of location parts
 * @returns {Array<string>} Deduplicated parts
 */
const dedupeParts = (parts) => {
  const seen = new Set();
  return parts.filter((part) => {
    if (!part) return false;
    const key = part.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Format a place name from geocoding data
 *
 * Creates human-readable location strings with smart abbreviations:
 * - US states abbreviated (California → CA)
 * - Duplicate parts removed (e.g., "Denver, Denver County" → "Denver")
 * - Format: "City, State/Region, Country" (or shorter if redundant)
 *
 * @param {object} place - Place data from geocoding API
 * @returns {string} Formatted place name
 *
 * @example
 * formatPlaceName({ name: "Denver", admin1: "Colorado", country_code: "US" })
 * // Returns: "Denver, CO, US"
 */
const formatPlaceName = (place = {}) => {
  const {
    name,
    city,
    town,
    village,
    admin1,
    admin2,
    state,
    country,
    country_code: countryCodeRaw,
  } = place;

  const countryCode = countryCodeRaw ? countryCodeRaw.toUpperCase() : null;

  const primary = name || city || town || village || admin2 || admin1;

  let region = admin1 || state || admin2 || null;
  if (countryCode === "US" && region) {
    region = US_STATE_ABBR[region] || region;
  }

  let countryPart = null;
  if (countryCode) {
    countryPart = countryCode;
  } else if (country && country !== region) {
    countryPart = country;
  }

  const parts = dedupeParts([primary, region, countryPart]);
  return parts.length ? parts.join(", ") : "Location";
};

/**
 * Geocode a place name to coordinates
 *
 * Uses Open-Meteo Geocoding API to convert place names to coordinates.
 * Returns the first/best match.
 *
 * @param {string} name - Place name to geocode
 * @returns {Promise<object>} Location data with lat, lon, city, tz
 * @throws {Error} If geocoding fails or no results found
 *
 * @example
 * const loc = await geocodePlace("Boulder, CO");
 * // Returns: { lat: 40.015, lon: -105.270, city: "Boulder, CO, US", tz: "America/Denver" }
 */
export const geocodePlace = async (name) => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("geocoding failed");

  const data = await res.json();
  if (!data.results?.[0]) throw new Error("no results");

  const place = data.results[0];
  return {
    lat: place.latitude,
    lon: place.longitude,
    city: formatPlaceName(place),
    tz: place.timezone || defaultTz,
  };
};

/**
 * Try Open-Meteo reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object|null>} Location data or null if failed
 */
const tryOpenMeteoReverse = async (lat, lon) => {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&count=1&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results?.[0]) return null;

    const place = data.results[0];
    return {
      city: formatPlaceName(place),
      tz: place.timezone || defaultTz,
    };
  } catch (error) {
    console.warn("Open-Meteo reverse geocoding failed:", error);
    return null;
  }
};

/**
 * Try Nominatim reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object|null>} Location data or null if failed
 */
const tryNominatimReverse = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const address = data.address || {};
    const formatted = formatPlaceName({
      name: address.city || address.town || address.village || data.name,
      admin1: address.state,
      admin2: address.county,
      country: address.country,
      country_code: address.country_code,
    });
    return { city: formatted, tz: defaultTz };
  } catch (error) {
    console.warn("Nominatim reverse geocoding failed:", error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to place name
 *
 * Converts lat/lon to human-readable location name.
 * Tries Open-Meteo first, falls back to Nominatim if needed.
 * Ultimate fallback: returns coordinates as string.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Location data with city name and timezone
 *
 * @example
 * const loc = await reverseGeocode(40.015, -105.270);
 * // Returns: { city: "Boulder, CO, US", tz: "America/Denver" }
 */
export const reverseGeocode = async (lat, lon) => {
  // Try Open-Meteo first
  const openMeteoResult = await tryOpenMeteoReverse(lat, lon);
  if (openMeteoResult) return openMeteoResult;

  // Fallback to Nominatim
  const nominatimResult = await tryNominatimReverse(lat, lon);
  if (nominatimResult) return nominatimResult;

  // Ultimate fallback: return coordinates as string
  return { city: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
};
