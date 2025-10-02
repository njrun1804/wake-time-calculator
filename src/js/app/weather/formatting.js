/**
 * Weather Module - Formatting Functions
 * Display formatters for weather data
 */

/**
 * Format temperature with fallback
 * @param {number|null} temp - Temperature in Fahrenheit
 * @returns {string} Formatted temperature
 */
export const formatTemp = (temp) => {
  return typeof temp === 'number' && !isNaN(temp)
    ? `${Math.round(temp)}°F`
    : '—';
};

/**
 * Format wind speed with fallback
 * @param {number|null} wind - Wind speed in mph
 * @returns {string} Formatted wind speed
 */
export const formatWind = (wind) => {
  return typeof wind === 'number' && !isNaN(wind)
    ? `${Math.round(wind)} mph`
    : '—';
};

/**
 * Format probability of precipitation
 * @param {number|null} pop - Probability of precipitation (0-100)
 * @returns {string} Formatted PoP
 */
export const formatPoP = (pop) => {
  return typeof pop === 'number' && !isNaN(pop) ? `${Math.round(pop)}%` : '—';
};

/**
 * Format inches (internal utility)
 * @param {number} value - Value in inches
 * @returns {string} Formatted inches
 */
export const inches = (value) => `${value.toFixed(2)}"`;

/**
 * Format inches with adaptive precision
 * @param {number} value - Value in inches
 * @returns {string} Formatted inches
 */
export const formatInches = (value) =>
  value >= 0.995 ? `${value.toFixed(1)}"` : `${value.toFixed(2)}"`;

/**
 * Format signed inches with +/- prefix
 * @param {number} value - Value in inches
 * @returns {string} Formatted signed inches
 */
export const formatSignedInches = (value) => {
  const magnitude = Math.abs(value);
  const formatted = formatInches(magnitude);
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatted}`;
};
