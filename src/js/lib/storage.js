/**
 * Wake Time Calculator - Storage Module
 * Manages localStorage persistence
 */

import { storageKeys, weatherStorage, defaults } from './constants.js';

/**
 * Storage manager for wake time calculator data
 */
export const Storage = {
  /**
   * Save a value to localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  save(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  /**
   * Load a value from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {string|null} Stored value or default
   */
  load(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Save all form values
   * @param {object} values - Form values to save
   */
  saveFormValues(values) {
    Object.entries(storageKeys).forEach(([field, key]) => {
      if (values[field] !== undefined) {
        this.save(key, values[field]);
      }
    });
  },

  /**
   * Load all form values
   * @returns {object} Loaded form values
   */
  loadFormValues() {
    const values = {};
    Object.entries(storageKeys).forEach(([field, key]) => {
      const value = this.load(key, defaults[field]);
      values[field] = value !== null ? String(value) : String(defaults[field]);
    });
    return values;
  },

  /**
   * Save weather location data
   * @param {object} location - Location data
   */
  saveWeatherLocation({ lat, lon, city, tz }) {
    if (lat !== undefined) this.save(weatherStorage.lat, lat);
    if (lon !== undefined) this.save(weatherStorage.lon, lon);
    if (city !== undefined) this.save(weatherStorage.city, city);
    if (tz !== undefined) this.save(weatherStorage.tz, tz);
  },

  /**
   * Load weather location data
   * @returns {object|null} Location data or null
   */
  loadWeatherLocation() {
    const lat = parseFloat(this.load(weatherStorage.lat));
    const lon = parseFloat(this.load(weatherStorage.lon));

    if (isNaN(lat) || isNaN(lon)) {
      return null;
    }

    return {
      lat,
      lon,
      city: this.load(weatherStorage.city, ''),
      tz: this.load(
        weatherStorage.tz,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ),
    };
  },

  /**
   * Clear all stored data
   */
  clear() {
    try {
      Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
      Object.values(weatherStorage).forEach((key) =>
        localStorage.removeItem(key)
      );
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },

  /**
   * Save cached data with timestamp
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  saveCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(key + ':t', String(Date.now()));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  },

  /**
   * Load cached data if not expired
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {any|null} Cached data or null if expired/not found
   */
  loadCache(key, maxAge) {
    try {
      const rawTimestamp = localStorage.getItem(key + ':t');
      if (rawTimestamp === null) {
        return null;
      }

      const timestamp = Number(rawTimestamp);
      if (!Number.isFinite(timestamp)) {
        return null;
      }

      if (Date.now() - timestamp > maxAge) {
        return null;
      }
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load cache:', error);
      return null;
    }
  },
};
