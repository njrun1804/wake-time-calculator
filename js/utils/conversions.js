/**
 * Wake Time Calculator - Conversion Utilities
 * Temperature and unit conversions
 */

/**
 * Convert Fahrenheit to Celsius
 * @param {number} f - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export const fToC = (f) => ((f - 32) * 5) / 9;

/**
 * Convert Celsius to Fahrenheit
 * @param {number} c - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const cToF = (c) => (c * 9) / 5 + 32;

/**
 * Calculate Stull wet bulb temperature
 * @param {number} tempC - Temperature in Celsius
 * @param {number} rh - Relative humidity (0-100)
 * @returns {number} Wet bulb temperature in Celsius
 */
export const stullWetBulbC = (tempC, rh) => {
  const atan = Math.atan;
  const sqrt = Math.sqrt;
  const wetBulb = tempC * atan(0.151977 * sqrt(rh + 8.313659)) +
    atan(tempC + rh) - atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * atan(0.023101 * rh) - 4.686035;
  return wetBulb;
};

/**
 * Calculate wind chill in Fahrenheit
 * @param {number} tempF - Temperature in Fahrenheit
 * @param {number} windMph - Wind speed in mph
 * @returns {number|null} Wind chill in Fahrenheit or null if not applicable
 */
export const windChillF = (tempF, windMph) => {
  if (tempF > 50 || windMph < 3) return null;
  const chill = 35.74 + 0.6215 * tempF - 35.75 * Math.pow(windMph, 0.16) +
    0.4275 * tempF * Math.pow(windMph, 0.16);
  return Math.round(chill);
};

/**
 * Convert meters per second to miles per hour
 * @param {number} ms - Speed in m/s
 * @returns {number} Speed in mph
 */
export const msToMph = (ms) => ms * 2.237;

/**
 * Convert kilometers per hour to miles per hour
 * @param {number} kmh - Speed in km/h
 * @returns {number} Speed in mph
 */
export const kmhToMph = (kmh) => kmh * 0.621371;