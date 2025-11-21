/**
 * Weather Module - Consolidated
 *
 * This module handles all weather-related functionality:
 * - API integration with Open-Meteo
 * - Trail wetness calculations based on precipitation dynamics
 * - Weather data formatting and display
 * - Moisture scoring with snowmelt and evapotranspiration
 *
 * Data Flow:
 * 1. fetchWeatherAround/fetchWetnessInputs → API calls with caching
 * 2. computeWetness → processes daily precipitation records
 * 3. interpretWetness → converts wetness data to trail conditions
 * 4. Format functions → display-ready strings
 *
 * Key Algorithms:
 * - Wetness Scoring: Precipitation + snowmelt - evapotranspiration, with time decay
 * - Trail Condition Mapping: Moisture thresholds → labels (Dry, Moist, Slick, Muddy, Soaked)
 * - Intensity Boost: Fast/heavy events weighted more than slow drizzle
 * - Seasonal Drying: Winter evapotranspiration 50% of summer (dormant vegetation)
 *
 * External APIs:
 * - Open-Meteo Forecast: https://api.open-meteo.com/v1/forecast
 *   - Hourly weather (temp, wind, precipitation probability)
 *   - Daily precipitation (rain, snow, ET₀)
 * - Cache duration: 1 hour (CACHE_DURATION constant)
 */

// External dependencies
import { CACHE_DURATION, MS_PER_HOUR } from "../lib/constants.js";
import { Storage } from "../lib/storage.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const snowCodes = new Set([71, 73, 75, 77, 85, 86]);

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Weather Configuration
 * Calibrated for Monmouth County, NJ (humid coastal climate, clay-rich soil)
 */
export const WEATHER_CONFIG = {
  // Drying dynamics
  DRYING_COEFFICIENT: 0.5,
  DECAY_BASE: 0.85,

  // Snow dynamics
  SNOW_MELT_THRESHOLD_F: 32,
  SNOW_MELT_CURVE_BASE_F: 32,
  SNOW_MELT_CURVE_RANGE_F: 6,
  SNOW_TO_WATER_RATIO: 0.143, // 1/7 ratio (heavy maritime snow)

  // Intensity
  MAX_INTENSITY_BOOST: 1.35,
  HEAVY_EVENT_THRESHOLD: 1.0,

  // Weather codes indicating snow
  SNOW_CODES: new Set([71, 73, 75, 77, 85, 86])
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Convert value to number or null
 * @param {any} value - Value to convert
 * @returns {number|null} Number or null if invalid
 */
export const numberOrNull = (value) =>
  typeof value === "number" && !Number.isNaN(value) ? value : null;

/**
 * Convert value to number with fallback to 0
 * @param {any} value - Value to convert
 * @returns {number} Number or 0 if invalid
 */
export const coerceNumber = (value) => numberOrNull(value) ?? 0;

/**
 * Sort records by date
 * @param {Array<object>} records - Records with date property
 * @returns {Array<object>} Sorted records
 */
export const sortByDate = (records) =>
  [...records].sort((a, b) => {
    if (!a?.date || !b?.date) return 0;
    if (a.date === b.date) return 0;
    return a.date < b.date ? -1 : 1;
  });

/**
 * Find the index of the time entry closest to target hour
 *
 * Tries exact hour match first, then finds closest match if exact not found.
 *
 * @param {Array<string>} times - Array of ISO time strings
 * @param {number} targetHour - Target hour (0-23)
 * @returns {number} Index of closest time, or -1 if times array is empty
 *
 * @example
 * findClosestHourIndex(['2024-01-01T05:00', '2024-01-01T06:00'], 6) // Returns 1
 * findClosestHourIndex(['2024-01-01T05:00', '2024-01-01T07:00'], 6) // Returns 1 (closer to 7 than 5)
 */
export const findClosestHourIndex = (times, targetHour) => {
  if (!Array.isArray(times) || times.length === 0) return -1;

  // First try exact match
  const exactIndex = times.findIndex(
    (t) => new Date(t).getHours() === targetHour,
  );
  if (exactIndex !== -1) return exactIndex;

  // Find closest hour
  let closestIndex = 0;
  let smallestDiff = Math.abs(new Date(times[0]).getHours() - targetHour);

  for (let i = 1; i < times.length; i++) {
    const hourDiff = Math.abs(new Date(times[i]).getHours() - targetHour);
    if (hourDiff < smallestDiff) {
      smallestDiff = hourDiff;
      closestIndex = i;
    }
  }

  return closestIndex;
};

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format temperature with fallback
 * @param {number|null} temp - Temperature in Fahrenheit
 * @returns {string} Formatted temperature
 */
export const formatTemp = (temp) => {
  return typeof temp === "number" && !isNaN(temp)
    ? `${Math.round(temp)}°F`
    : "—";
};

/**
 * Format wind speed with fallback
 * @param {number|null} wind - Wind speed in mph
 * @returns {string} Formatted wind speed
 */
export const formatWind = (wind) => {
  return typeof wind === "number" && !isNaN(wind)
    ? `${Math.round(wind)} mph`
    : "—";
};

/**
 * Format probability of precipitation
 * @param {number|null} pop - Probability of precipitation (0-100)
 * @returns {string} Formatted PoP
 */
export const formatPoP = (pop) => {
  return typeof pop === "number" && !isNaN(pop) ? `${Math.round(pop)}%` : "—";
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
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatted}`;
};

// ============================================================================
// WETNESS CALCULATIONS
// ============================================================================

/**
 * Create wetness summary text
 * @param {object} wetness - Wetness data
 * @returns {string} Summary text
 */
const createWetnessSummary = (wetness) => {
  if (!wetness) return "No recent precipitation signal";

  const parts = [];
  const {
    totals = {},
    recentWetDays = 0,
    analysisDays = 0,
    snowpackRemaining = 0,
  } = wetness;

  // computeWetness only populates rainfall, not precipitation
  // Use explicit rainfall value (already excludes snowfall)
  const totalRainfall = Math.max(
    0,
    numberOrNull(totals.rainfall) ?? numberOrNull(totals.rain) ?? 0,
  );

  const totalMelt = Math.max(0, numberOrNull(totals.melt) ?? 0);
  const totalLiquid = totalRainfall + totalMelt;

  if (totalLiquid > 0.01) {
    const windowText = analysisDays ? `${analysisDays}d` : "recent";
    parts.push(`${inches(totalLiquid)} liquid over ${windowText}`);
  }
  if (totalMelt > 0.01) {
    parts.push(`${inches(totalMelt)} melt contributions`);
  }
  if (typeof totals.drying === "number" && totals.drying > 0.01) {
    const et0Total = typeof totals.et0 === "number" ? totals.et0 : null;
    const dryingFraction =
      et0Total && et0Total > 0 ? Math.min(1, totals.drying / et0Total) : null;
    const dryingSummary =
      dryingFraction !== null
        ? `-${inches(totals.drying)} drying (${Math.round(
          dryingFraction * 100,
        )}% of ${inches(et0Total)} ET₀)`
        : `-${inches(totals.drying)} drying`;
    parts.push(dryingSummary);
  }
  if (snowpackRemaining > 0) {
    const snowDepth =
      WEATHER_CONFIG.SNOW_TO_WATER_RATIO > 0
        ? snowpackRemaining / WEATHER_CONFIG.SNOW_TO_WATER_RATIO
        : snowpackRemaining;
    if (snowDepth > 0.05) {
      const sweText = inches(snowpackRemaining);
      const depthText = inches(snowDepth);
      parts.push(`${sweText} SWE (${depthText} depth) snowpack remains`);
    }
  }
  if (recentWetDays > 0) {
    parts.push(`${recentWetDays} wet day${recentWetDays === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) {
    return "No meaningful precipitation in the past week";
  }

  return parts.join(" · ");
};

/**
 * Compute a moisture score based on precipitation, drying, and snowmelt dynamics.
 *
 * Algorithm:
 * 1. Process daily records chronologically
 * 2. Track snowpack accumulation and melt
 * 3. Calculate liquid contribution (rain + melt)
 * 4. Apply intensity boost for heavy/rapid events
 * 5. Subtract evapotranspiration (seasonal)
 * 6. Apply time decay to older events
 * 7. Sum to cumulative score
 *
 * @param {Array<object>} dailyRecords - Daily precipitation records
 * @param {object} [options] - Calculation options
 * @param {Date} [options.referenceDate] - Date to calculate relative to
 * @param {number} [options.dryingCoefficient] - Drying rate coefficient (default 0.5)
 * @returns {object} Wetness analysis with score, events, totals
 */
export const computeWetness = (
  dailyRecords = [],
  { referenceDate = null, dryingCoefficient = WEATHER_CONFIG.DRYING_COEFFICIENT } = {},
) => {
  if (!Array.isArray(dailyRecords) || dailyRecords.length === 0) {
    const base = {
      score: 0,
      analysisDays: 0,
      recentWetDays: 0,
      totals: {
        rainfall: 0,
        melt: 0,
        drying: 0,
        et0: 0,
      },
      snowpackRemaining: 0,
      events: [],
      referenceDate: referenceDate ? new Date(referenceDate) : null,
    };
    return {
      ...base,
      summary: createWetnessSummary(base),
    };
  }

  const refDate = referenceDate ? new Date(referenceDate) : null;
  const referenceMidnight = refDate ? new Date(refDate) : null;
  if (referenceMidnight) {
    referenceMidnight.setHours(0, 0, 0, 0);
  } else if (dailyRecords.length > 0) {
    // Warning: referenceDate is missing, time decay will use array index fallback
    // This may produce incorrect results if array structure changes
    console.warn(
      "[computeWetness] referenceDate is missing; using array index for time decay (may be inaccurate)",
    );
  }
  const sorted = sortByDate(dailyRecords);

  // Determine seasonal decay rate for Rumson, NJ climate
  // NJ has very different drying rates by season due to sun angle, humidity, day length
  const seasonalDecayBase = (() => {
    const month = refDate ? refDate.getMonth() : new Date().getMonth();
    // Summer (Jun-Aug): Fast drying due to warmth, longer days
    if (month >= 5 && month <= 7) return 0.75; // 3 days to mostly dry
    // Winter (Nov-Mar): Very slow drying - cloudy, humid, short days
    if (month >= 10 || month <= 2) return 0.92; // ~13 days to mostly dry
    // Spring/Fall (Apr-May, Sep-Oct): Moderate drying
    return 0.85; // 5 days to mostly dry (default)
  })();
  // Use seasonal rate instead of parameter (parameter kept for API compatibility)
  const effectiveDecayBase = seasonalDecayBase;

  // Optimization: Check if all records are in the same season (growing/dormant)
  // If so, we can calculate seasonal coefficient once instead of per-record
  const singleSeasonCoefficient = (() => {
    if (sorted.length === 0) return null;

    // Extract months from first and last records
    const getMonth = (dateStr) => {
      if (!dateStr || typeof dateStr !== "string") return null;
      const parts = dateStr.split("-");
      if (parts.length >= 2) {
        const monthNum = parseInt(parts[1], 10);
        return Number.isFinite(monthNum) && monthNum >= 1 && monthNum <= 12
          ? monthNum - 1
          : null;
      }
      return null;
    };

    const firstMonth = getMonth(sorted[0]?.date);
    const lastMonth = getMonth(sorted[sorted.length - 1]?.date);

    if (firstMonth === null || lastMonth === null) return null;

    // Check if both are in same season (growing: Apr-Oct = 3-9, dormant: Nov-Mar = 0-2,10-11)
    const isGrowing = (m) => m >= 3 && m <= 9;
    const firstGrowing = isGrowing(firstMonth);
    const lastGrowing = isGrowing(lastMonth);

    // If same season, return the coefficient; otherwise return null to calculate per-record
    if (firstGrowing === lastGrowing) {
      const warmSeason = firstGrowing;
      return warmSeason
        ? dryingCoefficient
        : Math.max(0, dryingCoefficient * 0.5);
    }
    return null;
  })();

  let cumulativeScore = 0;
  let runningSnowpack = 0;
  let totalRain = 0;
  let totalMelt = 0;
  let totalDrying = 0;
  let totalEt0 = 0;
  let recentWetDays = 0;
  let peakDailyBalance = 0;

  const events = sorted.map((entry, index) => {
    const {
      date,
      precipitation,
      rain,
      snowfall,
      precipHours,
      et0,
      maxTempF,
      minTempF,
    } = entry;

    // === STEP 1: Parse precipitation inputs ===
    // Some API responses have separate rain/snow, others just precipitation total
    const precipTotal = coerceNumber(precipitation);
    const snowDepthIn = Math.max(0, numberOrNull(snowfall) ?? 0);
    const snowSwe = snowDepthIn * WEATHER_CONFIG.SNOW_TO_WATER_RATIO; // Convert depth to water equivalent

    // Determine rain contribution, avoiding double-counting of snow
    // - If rain_sum is available, use it (explicit rain only)
    // - If rain_sum is null, subtract snow water equivalent from total precipitation
    //   to prevent counting atmospheric snow twice (once here, again when snowpack melts)
    const rainIn = (() => {
      const explicitRain = numberOrNull(rain);
      if (explicitRain !== null) {
        return explicitRain;
      }
      // Estimate rain by subtracting snow SWE from total precipitation
      return Math.max(0, precipTotal - snowSwe);
    })();

    const et0In = Math.max(0, numberOrNull(et0) ?? 0);
    totalEt0 += et0In;

    // === STEP 2: Accumulate snowpack ===
    // Snow accumulates until temperatures warm enough to melt it
    runningSnowpack += snowSwe;

    // === STEP 3: Calculate snowmelt ===
    // Snow melts when daily high exceeds 34°F (freezing point + margin)
    // Melt rate increases with temperature: 10% at 34°F, up to 100% at 42°F+
    let melt = 0;
    // Use maxTempF if available, otherwise fall back to minTempF
    // If even the daily minimum exceeds threshold, melting definitely occurs
    const thawTemp = numberOrNull(maxTempF) ?? numberOrNull(minTempF);
    if (
      runningSnowpack > 0 &&
      thawTemp !== null &&
      thawTemp >= WEATHER_CONFIG.SNOW_MELT_THRESHOLD_F
    ) {
      // thawFactor: 0.0 at SNOW_MELT_CURVE_BASE_F (32°F) → 1.0 at (32+10)=42°F
      // Example: 37°F → (37-32)/10 = 0.5 → 50% of snowpack melts
      const thawFactor = Math.min(
        1,
        (thawTemp - WEATHER_CONFIG.SNOW_MELT_CURVE_BASE_F) / WEATHER_CONFIG.SNOW_MELT_CURVE_RANGE_F,
      );
      melt = Math.min(
        runningSnowpack,
        runningSnowpack * Math.max(0.1, thawFactor), // Min 10% melt when above threshold
      );
      runningSnowpack = Math.max(0, runningSnowpack - melt);
    }

    totalMelt += melt;

    // === STEP 4: Compute total liquid contribution ===
    // Liquid = rain + snowmelt (both contribute to trail wetness)
    const rainContribution = Math.max(0, rainIn);
    const liquid = rainContribution + melt;
    totalRain += rainContribution;

    // === STEP 5: Apply intensity boost ===
    // Fast/heavy events saturate trails more than slow drizzle
    // Rationale: 1" in 1 hour creates more runoff/pooling than 1" over 24 hours
    const intensityBoost = (() => {
      const hours = numberOrNull(precipHours);
      let rate;

      if (!hours || hours <= 0) {
        // No duration data: assume typical storm duration (6 hours) to estimate intensity
        // This prevents overweighting slow drizzle events
        const assumedStormDuration = 6;
        rate = liquid / assumedStormDuration;
      } else {
        rate = liquid / hours; // inches per hour
      }

      // Thresholds based on NWS intensity classifications:
      // - Heavy: ≥0.3"/hr → 1.35x boost
      // - Moderate: 0.1-0.3"/hr → 1.1-1.2x boost
      // - Light: <0.1"/hr → 1.0x (no boost)
      if (rate >= 0.35) return WEATHER_CONFIG.MAX_INTENSITY_BOOST; // 1.35
      if (rate >= 0.2) return 1.2;
      if (rate >= 0.1) return 1.1;
      return 1;
    })();

    // === STEP 6: Calculate seasonal drying ===
    // Evapotranspiration (ET₀) varies by season due to vegetation
    // Use pre-calculated coefficient if all records are in same season (optimization)
    const seasonalDryingCoefficient =
      singleSeasonCoefficient !== null
        ? singleSeasonCoefficient
        : (() => {
          // Extract month directly from YYYY-MM-DD string to avoid timezone parsing issues
          // (new Date("2024-10-23") is parsed as UTC, which becomes wrong local date in negative UTC offsets)
          const month =
            (() => {
              if (date && typeof date === "string") {
                const parts = date.split("-");
                if (parts.length >= 2) {
                  const monthNum = parseInt(parts[1], 10);
                  // Convert to 0-indexed (1 = Jan -> 0)
                  return Number.isFinite(monthNum) &&
                    monthNum >= 1 &&
                    monthNum <= 12
                    ? monthNum - 1
                    : null;
                }
              }
              return null;
            })() ?? (refDate ? refDate.getMonth() : new Date().getMonth());

          const leafOn = month >= 3 && month <= 9; // Apr–Oct (growing season)
          const warmSeasonCoefficient = dryingCoefficient; // Default 0.5
          const coolSeasonCoefficient = Math.max(0, dryingCoefficient * 0.5); // 50% reduction (dormant plants = 0.25)
          // Why 50%? Dormant vegetation transpires much less, but ground evaporation continues
          return leafOn ? warmSeasonCoefficient : coolSeasonCoefficient;
        })();

    const drying = seasonalDryingCoefficient * et0In;
    totalDrying += drying;

    // === STEP 7: Compute daily moisture balance ===
    // dailyBalance = net moisture added to trails
    // Positive = wetter, Negative = drier
    // Apply intensity boost only to liquid contribution, not to drying
    const dailyBalance = liquid * intensityBoost - drying;
    peakDailyBalance = Math.max(peakDailyBalance, dailyBalance);

    if (liquid > 0.05) {
      recentWetDays += 1; // Count as "wet day" if ≥0.05" liquid
    }

    // === STEP 8: Apply time decay ===
    // Older events matter less (trails dry over time)
    // Uses seasonal decay rate for Rumson, NJ:
    // - Summer (0.75/day): 1d=75%, 3d=42%, 7d=13%
    // - Spring/Fall (0.85/day): 1d=85%, 3d=61%, 7d=32%
    // - Winter (0.92/day): 1d=92%, 3d=78%, 7d=55%
    const ageDays = (() => {
      if (referenceMidnight && date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const diff = (referenceMidnight - dayStart) / MS_PER_DAY;
        return Number.isFinite(diff) && diff > 0 ? diff : 0;
      }
      // Fallback: use index offset if no date
      const offset = sorted.length - 1 - index;
      return offset < 0 ? 0 : offset;
    })();

    const decay = Math.pow(effectiveDecayBase, ageDays);
    const decayedBalance = dailyBalance * decay;
    cumulativeScore += decayedBalance;

    return {
      date,
      rain: rainIn,
      snowfall: snowDepthIn,
      snowfallSWE: snowSwe,
      melt,
      et0: et0In,
      precipHours: numberOrNull(precipHours),
      maxTempF: thawTemp,
      minTempF: numberOrNull(minTempF),
      liquid,
      drying,
      balance: dailyBalance,
      decayedBalance,
      decay,
      ageDays,
    };
  });

  // Normalize score by adding 5% of peak daily balance
  // Why 5%? This provides a small boost when there was a single intense event,
  // preventing the score from being too low when time decay reduces impact
  // but trail conditions remain affected by the peak moisture event.
  // Example: Heavy rain 3 days ago may be 61% decayed, but trails still muddy.
  const normalizedScore =
    cumulativeScore + Math.max(0, peakDailyBalance * 0.05);

  const result = {
    score: Math.max(0, Number.isFinite(normalizedScore) ? normalizedScore : 0),
    analysisDays: sorted.length,
    recentWetDays,
    totals: {
      rainfall: Number(totalRain.toFixed(3)),
      melt: Number(totalMelt.toFixed(3)),
      drying: Number(totalDrying.toFixed(3)),
      et0: Number(totalEt0.toFixed(3)),
    },
    snowpackRemaining: Number(runningSnowpack.toFixed(3)),
    events,
    referenceDate: refDate,
  };

  return {
    ...result,
    summary: createWetnessSummary(result),
  };
};

// ============================================================================
// ANALYSIS - WETNESS INTERPRETATION
// ============================================================================

/**
 * Sum liquid within time window
 * @param {Array<object>} events - Event array
 * @param {number} maxAgeDays - Maximum age in days
 * @returns {number} Total liquid
 */
const sumWindowLiquid = (events, maxAgeDays) =>
  events.reduce((total, evt) => {
    if (!evt) return total;
    const age = typeof evt.ageDays === "number" ? evt.ageDays : Infinity;
    if (age > maxAgeDays) return total;
    const liquid = Math.max(0, numberOrNull(evt.liquid) ?? 0);
    return total + liquid;
  }, 0);

/**
 * Determine confidence level based on analysis window
 * @param {number} analysisDays - Number of days analyzed
 * @returns {string} Confidence level
 */
const confidenceForWindow = (analysisDays = 0) => {
  if (analysisDays >= 6) return "high";
  if (analysisDays >= 4) return "medium";
  return "low";
};

/**
 * Interpret wetness data into trail condition assessment
 *
 * Decision Logic (calibrated for Monmouth County clay-rich soil w/ moderate drainage):
 * - Snowbound (rating 5): >1" snow depth remaining
 * - Packed Snow (rating 4): 0.25-1" snow remaining
 * - Soaked (rating 5): >0.5" in 24h, >1.3" net liquid, or heavy 48h event
 * - Muddy (rating 4): >0.35" in 48h, heavy event, or 2+ freeze/thaw cycles
 * - Slick/Icy (rating 3): >0.20" in 72h, 3+ wet days, or freeze with liquid
 * - Moist (rating 2): Any moisture signal
 * - Dry (rating 1): No significant moisture
 *
 * Thresholds are lower than sandy/rocky terrain because clay-rich soil holds
 * moisture longer and rooty/rocky sections (Hartshorne, Huber Woods) get slick easily.
 *
 * @param {object} wetnessData - Wetness data from computeWetness
 * @returns {object} Trail condition interpretation with label, caution, rating, stats
 */
export const interpretWetness = (wetnessData = null) => {
  if (!wetnessData) {
    return {
      label: "Dry",
      detail: "No precipitation history available",
      caution: "",
      rating: 1,
      confidence: "low",
      stats: {},
    };
  }

  const events = Array.isArray(wetnessData.events) ? wetnessData.events : [];
  const snowpackSWE = Math.max(
    0,
    numberOrNull(wetnessData.snowpackRemaining) ?? 0,
  );
  const snowpackDepth =
    WEATHER_CONFIG.SNOW_TO_WATER_RATIO > 0 ? snowpackSWE / WEATHER_CONFIG.SNOW_TO_WATER_RATIO : snowpackSWE;
  const recentWetDays = Math.max(
    0,
    numberOrNull(wetnessData.recentWetDays) ?? 0,
  );

  const totals = wetnessData.totals ?? {};
  // computeWetness only populates rainfall, not precipitation
  const totalRainfall = Math.max(
    0,
    numberOrNull(totals.rainfall) ?? numberOrNull(totals.rain) ?? 0,
  );

  const totalMelt = Math.max(0, numberOrNull(totals.melt) ?? 0);
  const totalLiquid = totalRainfall + totalMelt;
  const dryingTotal = Math.max(0, numberOrNull(totals.drying) ?? 0);
  const et0Total = Math.max(0, numberOrNull(totals.et0) ?? 0);
  const netLiquid = Math.max(0, totalLiquid - dryingTotal);

  const last24 = sumWindowLiquid(events, 1.1);
  const last48 = sumWindowLiquid(events, 2.1);
  const last72 = sumWindowLiquid(events, 3.1);
  const wetDaysLast72 = events.reduce((count, evt) => {
    if (!evt) return count;
    const age = typeof evt.ageDays === "number" ? evt.ageDays : Infinity;
    if (age > 3) return count;
    const liquidAmt = Math.max(0, numberOrNull(evt.liquid) ?? 0);
    const meltAmt = Math.max(0, numberOrNull(evt.melt) ?? 0);
    return liquidAmt + meltAmt >= 0.02 ? count + 1 : count;
  }, 0);

  const heavyEvent = events.some(
    (evt) =>
      typeof evt?.balance === "number" && evt.balance >= WEATHER_CONFIG.HEAVY_EVENT_THRESHOLD,
  );

  const freezeThawCycles = events.reduce((count, evt) => {
    if (
      typeof evt?.minTempF === "number" &&
      typeof evt?.maxTempF === "number" &&
      evt.minTempF <= 30 &&
      evt.maxTempF >= 34
    ) {
      return count + 1;
    }
    return count;
  }, 0);

  const detailParts = [];
  if (last24 > 0.01) {
    detailParts.push(`${formatInches(last24)} last 24h`);
  } else if (last48 > 0.01) {
    detailParts.push(`${formatInches(last48)} over 48h`);
  } else if (last72 > 0.01) {
    detailParts.push(`${formatInches(last72)} over 72h`);
  }

  if (dryingTotal > 0.05) {
    const dryingFraction =
      et0Total > 0.05 ? Math.min(1, dryingTotal / et0Total) : null;
    const dryingDescriptor =
      dryingFraction !== null
        ? `-${formatInches(dryingTotal)} drying (${Math.round(
          dryingFraction * 100,
        )}% of ${formatInches(et0Total)} ET₀)`
        : `-${formatInches(dryingTotal)} drying`;
    detailParts.push(dryingDescriptor);
  }

  if (recentWetDays > 0) {
    detailParts.push(
      `${recentWetDays} wet day${recentWetDays === 1 ? "" : "s"}`,
    );
  }

  const moistSignal = last72 >= 0.05 || netLiquid >= 0.15 || wetDaysLast72 >= 1;

  const freezeWithLiquid =
    freezeThawCycles > 0 &&
    (last24 >= 0.02 || last48 >= 0.03 || moistSignal || snowpackDepth >= 0.1);

  const freezeOnly = freezeThawCycles > 0 && !freezeWithLiquid;

  const stats = {
    last24,
    last48,
    last72,
    weeklyLiquid: totalLiquid,
    weeklyRainfall: totalRainfall,
    weeklyMelt: totalMelt,
    dryingTotal,
    et0Total,
    netLiquid,
    snowpack: snowpackDepth,
    snowpackDepth,
    snowpackSWE,
    recentWetDays,
    heavyEvent,
    freezeThawCycles,
    wetDaysLast72,
    freezeWithLiquid,
    moistSignal,
  };

  const confidence = confidenceForWindow(wetnessData.analysisDays);
  if (confidence !== "high") {
    detailParts.push(`${confidence} confidence`);
  }

  let label = "Dry";
  let caution = "";
  let rating = 1;

  if (snowpackDepth >= 1) {
    label = "Snowbound";
    caution = "Deep snow coverage—expect winter footing throughout.";
    rating = 5;
  } else if (snowpackDepth >= 0.25) {
    label = "Packed Snow";
    caution = "Lingering snow/ice—microspikes recommended.";
    rating = 4;
  } else {
    if (last24 >= 0.5 || netLiquid >= 1.3 || (last48 >= 0.9 && heavyEvent)) {
      label = "Soaked";
      caution = "Standing water and boot-sucking mud—plan for slow miles.";
      rating = 5;
    } else if (
      last48 >= 0.35 ||
      (last72 >= 0.6 && netLiquid >= 0.6) ||
      heavyEvent ||
      freezeThawCycles >= 2
    ) {
      label = "Muddy";
      caution = "Trail bed is saturated—gaiters/poles will help stability.";
      rating = 4;
    } else if (
      last72 >= 0.2 ||
      recentWetDays >= 3 ||
      netLiquid >= 0.35 ||
      freezeWithLiquid
    ) {
      const icy = freezeWithLiquid;
      label = icy ? "Slick/Icy" : "Slick";
      caution = icy
        ? "Freeze-thaw has glazed shady sections—watch for ice."
        : "Soft tacky ground—expect slower corners and climbs.";
      rating = 3;
    } else if (moistSignal) {
      label = "Moist";
      caution = "";
      rating = 2;
    }
  }

  if (freezeOnly) {
    caution = caution
      ? `${caution} Icy bridges possible from overnight refreeze.`
      : "Freeze-thaw overnight—bridges may still be icy despite dry tread.";
    rating = Math.max(rating, 2);
  }

  const decision = (() => {
    // Only Soaked/Snowbound are hazardous from runner perspective
    if (label === "Soaked" || label === "Snowbound") {
      return "Hazard";
    }
    // Muddy/Slick/Packed Snow need caution but are runnable with prep
    if (
      label === "Muddy" ||
      label === "Slick" ||
      label === "Slick/Icy" ||
      label === "Packed Snow" ||
      Boolean(caution)
    ) {
      return "Caution";
    }
    return "OK";
  })();

  const metricsSummary = [
    `24h ${formatInches(last24)}`,
    `48h ${formatInches(last48)}`,
    `72h ${formatInches(last72)}`,
    `Net ${formatSignedInches(netLiquid)}`,
  ];
  if (totalLiquid > 0.01) {
    metricsSummary.push(`Liquid ${formatInches(totalLiquid)} (7d)`);
  }
  if (totalMelt > 0.01) {
    metricsSummary.push(`Melt ${formatInches(totalMelt)} (7d)`);
  }
  if (wetDaysLast72 > 0) {
    metricsSummary.push(
      `${wetDaysLast72} wet day${wetDaysLast72 === 1 ? "" : "s"} (72h)`,
    );
  }
  if (freezeThawCycles > 0) {
    metricsSummary.push(`Freeze/thaw ${freezeThawCycles}`);
  }

  const detail =
    [...detailParts, metricsSummary.join(" · ")].filter(Boolean).join(" · ") ||
    wetnessData.summary ||
    "";

  return {
    label,
    detail,
    caution,
    rating,
    confidence,
    stats,
    decision,
  };
};

/**
 * Get wetness category label
 * @param {object} wetnessData - Wetness data
 * @returns {string} Category label
 */
export const categorizeWetness = (wetnessData) =>
  interpretWetness(wetnessData).label;

// ============================================================================
// API INTEGRATION
// ============================================================================

/**
 * Fetch data with caching using Storage module
 * @param {string} key - Cache key
 * @param {Function} fetcher - Function that returns Promise<data>
 * @param {AbortSignal} signal - Abort signal
 * @returns {Promise<any>} Cached or fresh data
 */
const fetchWithCache = async (key, fetcher, signal = null) => {
  const cached = Storage.loadCache(key, CACHE_DURATION);
  if (cached) return cached;

  const data = await fetcher(signal);
  Storage.saveCache(key, data);
  return data;
};

/**
 * Fetch weather data around a specific time
 *
 * Uses Open-Meteo Forecast API to get hourly weather for a target date/time.
 * Caches results for 1 hour to reduce API load.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Date} whenLocal - Local time to get weather for
 * @param {string} tz - Timezone (IANA format, e.g., 'America/New_York')
 * @returns {Promise<object>} Weather data with tempF, windMph, windChillF, pop, wetBulbF, isSnow
 */
export const fetchWeatherAround = async (lat, lon, whenLocal, tz) => {
  const hrKey = `hourly_${lat}_${lon}_${Math.floor(whenLocal.getTime() / MS_PER_HOUR)}`;

  return fetchWithCache(hrKey, async (signal) => {
    const ymd = whenLocal.toLocaleDateString("en-CA");
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      hourly:
        "temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,precipitation_probability,wet_bulb_temperature_2m,weathercode,snowfall",
      timezone: tz,
      start_date: ymd,
      end_date: ymd,
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("Failed to fetch weather data");

    const data = await res.json();
    if (!data.hourly) throw new Error("No hourly weather data available");

    // Find closest hour to the target time
    const targetHour = whenLocal.getHours();
    const times = data.hourly.time;
    const index = findClosestHourIndex(times, targetHour);

    if (index === -1)
      throw new Error("No hourly data available for target time");

    const weatherCode = data.hourly.weathercode?.[index];
    const tempF = data.hourly.temperature_2m?.[index] ?? null;
    const windMph = data.hourly.wind_speed_10m?.[index] ?? null;
    const pop = data.hourly.precipitation_probability?.[index] ?? null;
    const wetBulbF = data.hourly.wet_bulb_temperature_2m?.[index] ?? null;
    const snowfall = data.hourly.snowfall?.[index] ?? null;

    // Calculate wind chill
    let windChillF = null;
    if (typeof tempF === "number" && typeof windMph === "number") {
      if (tempF <= 50 && windMph >= 3) {
        windChillF =
          35.74 +
          0.6215 * tempF -
          35.75 * Math.pow(windMph, 0.16) +
          0.4275 * tempF * Math.pow(windMph, 0.16);
      } else {
        windChillF = tempF;
      }
    }

    // Determine if it's snowy conditions
    const isSnow =
      (typeof weatherCode === "number" && snowCodes.has(weatherCode)) ||
      (typeof snowfall === "number" && snowfall > 0);

    return {
      tempF,
      windMph,
      windChillF,
      pop,
      wetBulbF,
      isSnow,
      weatherCode,
      snowfall,
    };
  });
};

/**
 * Fetch wetness inputs (precipitation data for surface conditions)
 *
 * Retrieves 7 days of historical precipitation data before dawn to assess
 * trail surface conditions. Uses Open-Meteo Forecast API's historical mode.
 * Caches results per location/date to reduce API load.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Date} dawnLocalDate - Dawn date in local time
 * @param {string} tz - Timezone (IANA format)
 * @returns {Promise<object>} Wetness analysis from computeWetness
 */
export const fetchWetnessInputs = async (lat, lon, dawnLocalDate, tz) => {
  const dawnYMD = dawnLocalDate.toLocaleDateString("en-CA");
  const key = `wetness_${lat}_${lon}_${dawnYMD}`;

  return fetchWithCache(key, async (signal) => {
    // Get 7 days of historical data before dawn day
    const startDate = new Date(dawnLocalDate);
    startDate.setDate(startDate.getDate() - 7);
    const startYMD = startDate.toLocaleDateString("en-CA");

    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      daily:
        "precipitation_sum,precipitation_hours,rain_sum,snowfall_sum,et0_fao_evapotranspiration,temperature_2m_max,temperature_2m_min",
      timezone: tz,
      start_date: startYMD,
      end_date: dawnYMD,
      precipitation_unit: "inch",
      temperature_unit: "fahrenheit",
      snowfall_unit: "inch",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("Failed to fetch wetness data");

    const data = await res.json();
    if (!data.daily) {
      return computeWetness([], { referenceDate: dawnLocalDate });
    }

    // Keep only days strictly BEFORE the dawn day (we're judging surface state going into dawn)
    const dailyRecords = [];
    const {
      time: days,
      precipitation_sum: precipTotals = [],
      precipitation_hours: precipHours = [],
      rain_sum: rainTotals = [],
      snowfall_sum: snowTotals = [],
      et0_fao_evapotranspiration: et0Totals = [],
      temperature_2m_max: maxTemps = [],
      temperature_2m_min: minTemps = [],
    } = data.daily;

    days.forEach((dayStr, index) => {
      // Filter out days on or after dawn day (we want only prior days)
      // Use date comparison instead of string comparison for robustness
      if (typeof dayStr !== "string") return;
      if (new Date(dayStr) >= new Date(dawnYMD)) return;

      dailyRecords.push({
        date: dayStr,
        precipitation: numberOrNull(precipTotals[index]),
        rain: numberOrNull(rainTotals[index]),
        snowfall: numberOrNull(snowTotals[index]),
        precipHours: numberOrNull(precipHours[index]),
        et0: numberOrNull(et0Totals[index]),
        maxTempF: numberOrNull(maxTemps[index]),
        minTempF: numberOrNull(minTemps[index]),
      });
    });

    const wetness = computeWetness(dailyRecords, {
      referenceDate: dawnLocalDate,
    });

    // Note: createWetnessSummary is called inside computeWetness
    return wetness;
  });
};
