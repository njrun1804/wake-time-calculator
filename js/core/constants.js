/**
 * Wake Time Calculator - Core Constants
 * Shared constants used across the application
 */

export const PREP_MINUTES = 45; // Fixed prep time - not user-configurable by design
export const PREP_BEFORE_RUN = 20; // Portion of prep before leaving for run
export const MINUTES_PER_DAY = 1440;
export const MINUTES_PER_HOUR = 60;
export const MM_TO_INCHES = 25.4;
export const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const defaults = {
  firstMeeting: '08:30',
  run: 0,
  travel: 0,
  breakfast: 0,
  location: 'round-town',
};

export const storageKeys = {
  firstMeeting: 'wake:meeting', // Fixed to match test expectations
  run: 'wake:run',
  travel: 'wake:travel',
  breakfast: 'wake:breakfast',
  location: 'wake:location',
};

export const weatherStorage = {
  lat: 'wake:weatherLat',
  lon: 'wake:weatherLon',
  city: 'wake:weatherCity',
  tz: 'wake:weatherTz',
};

export const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
