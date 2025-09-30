/**
 * Weather Module - Barrel Export
 * Maintains backward compatibility with existing imports
 */

// Export all constants
export {
  MS_PER_DAY,
  DEFAULT_DRYING_COEFFICIENT,
  DEFAULT_DECAY_BASE,
  SNOW_MELT_THRESHOLD_F,
  MAX_INTENSITY_BOOST,
  SNOW_TO_WATER_RATIO,
  HEAVY_EVENT_THRESHOLD,
  snowCodes,
} from './constants.js';

// Export all utilities
export { numberOrNull, coerceNumber, sortByDate } from './utils.js';

// Export all formatting functions
export {
  formatTemp,
  formatWind,
  formatPoP,
  inches,
  formatInches,
  formatSignedInches,
} from './formatting.js';

// Export wetness calculations
export { computeWetness } from './wetness.js';

// Export analysis functions
export { interpretWetness, categorizeWetness } from './analysis.js';

// Export API functions
export { fetchWeatherAround, fetchWetnessInputs } from './api.js';
