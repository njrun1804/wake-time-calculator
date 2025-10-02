/**
 * Weather Module - Constants
 * Time constants, wetness parameters, and weather codes
 */

/**
 * Milliseconds in a day
 */
export const MS_PER_DAY = 86400000;

/**
 * Default coefficient for drying rate calculation
 */
export const DEFAULT_DRYING_COEFFICIENT = 0.6;

/**
 * Default decay base for wetness score over time
 */
export const DEFAULT_DECAY_BASE = 0.85;

/**
 * Temperature threshold (°F) above which snow begins to melt
 */
export const SNOW_MELT_THRESHOLD_F = 34;

/**
 * Maximum intensity boost factor for precipitation events
 */
export const MAX_INTENSITY_BOOST = 1.35;

/**
 * Ratio for converting snow depth to snow water equivalent
 */
export const SNOW_TO_WATER_RATIO = 0.1;

/**
 * Threshold (inches) for heavy precipitation event
 */
export const HEAVY_EVENT_THRESHOLD = 1.2;

/**
 * Weather codes that indicate snow conditions
 */
export const snowCodes = new Set([71, 73, 75, 77, 85, 86]);
