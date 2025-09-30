/**
 * Awareness Module - Core Logic
 * Main awareness refresh and initialization
 */

import { Storage } from '../../lib/storage.js';
import { defaultTz } from '../../lib/constants.js';
import { fetchWeatherAround, fetchWetnessInputs } from '../weather/index.js';
import { fetchDawn } from '../dawn/index.js';
import { reverseGeocode } from '../location/index.js';
import { updateAwarenessDisplay, showAwarenessError } from './display.js';
import { emitAwarenessEvent } from './events.js';

/**
 * Refresh weather awareness data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} city - City name (optional)
 * @param {string} tz - Timezone (optional)
 */
export const refreshAwareness = async (lat, lon, city = '', tz = defaultTz) => {
  try {
    const controller = new AbortController();
    const signal = controller.signal;

    // Timeout after 10 seconds
    setTimeout(() => controller.abort(), 10000);

    // Fetch dawn first
    const dawnDate = await fetchDawn(lat, lon, tz, signal);

    // Parallel fetch weather & wetness
    const [weather, wetnessInfo] = await Promise.all([
      fetchWeatherAround(lat, lon, dawnDate, tz),
      fetchWetnessInputs(lat, lon, dawnDate, tz),
    ]);

    let displayCity = city;
    if (displayCity && !displayCity.includes(',')) {
      try {
        const refined = await reverseGeocode(lat, lon);
        if (refined?.city) {
          displayCity = refined.city;
          Storage.saveWeatherLocation({
            lat,
            lon,
            city: displayCity,
            tz: refined.tz || tz,
          });
        }
      } catch (error) {
        console.warn('City refinement failed:', error);
      }
    }

    // Update display with all data
    const displayResult = updateAwarenessDisplay({
      city: displayCity || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      dawn: dawnDate,
      windChillF: weather.windChillF,
      pop: weather.pop,
      wetBulbF: weather.wetBulbF,
      tempF: weather.tempF,
      windMph: weather.windMph,
      weatherCode: weather.weatherCode,
      snowfall: weather.snowfall,
      isSnow: weather.isSnow,
      wetnessData: wetnessInfo,
      tz,
    });

    emitAwarenessEvent('ready', {
      city:
        displayResult?.city ||
        displayCity ||
        `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      label: displayResult?.wetnessInsight?.label ?? null,
      decision: displayResult?.decision ?? null,
      dawn: dawnDate?.toISOString?.() ?? null,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Awareness refresh aborted:', error);
      showAwarenessError('Request timed out');
    } else {
      console.error('Awareness refresh failed:', error);
      showAwarenessError('Unable to load weather data');
    }
  }
};
