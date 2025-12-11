/**
 * Awareness Module - Consolidated
 *
 * This module handles weather awareness functionality:
 * - Location detection and management
 * - Weather data fetching and display
 * - Trail wetness analysis and recommendations
 * - Status icon updates (dawn, wind chill, precipitation, wet bulb)
 * - User interaction handlers
 *
 * Data Flow:
 * 1. initializeAwareness → loads saved location or requests geolocation
 * 2. refreshAwareness → fetches dawn, weather, wetness data
 * 3. updateAwarenessDisplay → updates UI with status icons
 * 4. Event system → tracks state changes for testing/debugging
 *
 * Status Icon Logic (3 states):
 * - OK (✅): Conditions are favorable
 * - Yield (⚠): Caution advised (runnable with prep/gear)
 * - Warning (⛔): Hazard (unsafe or extremely unpleasant)
 *
 * Initialization Fallback Chain:
 * 1. Try saved location from localStorage
 * 2. Try browser geolocation (silent, no prompt)
 * 3. Wait for user to click "Use my location"
 *
 * Cross-module Dependencies:
 * - weather.ts: fetchWeatherAround, fetchWetnessInputs, interpretWetness
 * - location.ts: getCurrentLocation, reverseGeocode, geocodePlace
 * - dawn.ts: fetchDawn (for dawn time)
 * - main.ts: calls updateLocationHeadlamp when awareness ready
 */

// External dependencies
import { Storage } from "../lib/storage.js";
import { defaultTz, isError, getErrorMessage } from "../lib/constants.js";
import { fmtTime12InZone, getMinutesSinceMidnightInZone } from "../lib/time.js";
import { toMinutes } from "../lib/calculator.js";
import {
  fetchWeatherAround,
  fetchWetnessInputs,
  interpretWetness,
  formatTemp,
  formatPoP,
  WeatherData,
  WetnessData,
  type WetnessInterpretation,
} from "./weather.js";
import { fetchDawn, DawnInfo } from "./dawn.js";
import {
  getCurrentLocation,
  reverseGeocode,
  geocodePlace,
  validateCoordinates,
  formatCoordinates,
  Coordinates,
  LocationInfo,
} from "./location.js";

// ============================================================================
// TYPES
// ============================================================================

export type StatusIconStatus = "ok" | "yield" | "warning" | "none";

export type AwarenessEventType =
  | "init"
  | "ready"
  | "error"
  | "location-updated"
  | "location-requested"
  | "location-error"
  | "location-denied"
  | "search-started"
  | "search-error";

export interface AwarenessEventDetail {
  source?: string;
  message?: string;
  city?: string;
  lat?: number;
  lon?: number;
  label?: string | null;
  decision?: string | null;
  dawn?: string | null;
  query?: string;
}

export interface AwarenessEventPayload {
  type: AwarenessEventType;
  detail: AwarenessEventDetail;
  timestamp: number;
}

export interface AwarenessElements {
  awCity: HTMLElement | null;
  awDawn: HTMLTimeElement | null;
  awMsg: HTMLElement | null;
  awWindChill: HTMLElement | null;
  awPoP: HTMLElement | null;
  awWetBulb: HTMLElement | null;
  awDawnIcon: HTMLElement | null;
  awWindChillIcon: HTMLElement | null;
  awPoPIcon: HTMLElement | null;
  awWetBulbIcon: HTMLElement | null;
  awWetness: HTMLElement | null;
  awDecisionIcon: HTMLElement | null;
  awDecisionText: HTMLElement | null;
  useLoc: HTMLButtonElement | null;
  placeInput: HTMLInputElement | null;
  setPlace: HTMLButtonElement | null;
  defaultMsg: string | null;
}

export interface AwarenessDisplayData {
  city?: string;
  dawn?: DawnInfo | null;
  windChillF?: number | null;
  pop?: number | null;
  wetBulbF?: number | null;
  tempF?: number | null;
  windMph?: number | null;
  weatherCode?: number | null;
  snowfall?: number | null;
  isSnow?: boolean;
  wetnessData?: WetnessData | null;
  tz: string;
}

// ============================================================================
// TYPES
// ============================================================================

export interface AwarenessDisplayResult {
  wetnessInsight?: WetnessInterpretation | null;
  decision?: string | null;
  city?: string | null;
  dawn?: DawnInfo | null;
  runStartMinutes?: number | null;
  timezone?: string;
}

interface AwarenessDataResult {
  dawnData: DawnInfo;
  weather: WeatherData;
  wetnessInfo: WetnessData | null;
}

declare global {
  interface Window {
    __awarenessEvents?: AwarenessEventPayload[];
    __onAwarenessEvent?: (payload: AwarenessEventPayload) => void;
    __latestWetnessInsight?: WetnessInterpretation | null;
    __latestWetnessRaw?: WetnessData | null;
    __latestSchedule?: {
      runStartMinutes?: number;
      runStartTime?: string;
    };
    updateLocationHeadlamp?: () => void;
  }
}

// ============================================================================
// EVENT SYSTEM
// ============================================================================

/**
 * Emit awareness event for tracking and testing
 *
 * Events are stored in window.__awarenessEvents array for debugging
 * and can trigger custom callbacks via window.__onAwarenessEvent.
 */
export const emitAwarenessEvent = (
  type: AwarenessEventType,
  detail: AwarenessEventDetail = {}
): void => {
  if (typeof window === "undefined") return;
  const payload: AwarenessEventPayload = {
    type,
    detail,
    timestamp: Date.now(),
  };
  if (!Array.isArray(window.__awarenessEvents)) {
    window.__awarenessEvents = [];
  }
  window.__awarenessEvents.push(payload);
  if (typeof window.__onAwarenessEvent === "function") {
    try {
      window.__onAwarenessEvent(payload);
    } catch (error) {
      console.error("awareness event callback failed", error);
    }
  }
};

// ============================================================================
// STATUS COMPUTATION
// ============================================================================

/**
 * Set status icon appearance
 */
export const setStatusIcon = (iconEl: HTMLElement | null, status: StatusIconStatus): void => {
  if (!iconEl) return;
  iconEl.classList.add("hidden");
  iconEl.classList.remove("icon-ok", "icon-yield", "icon-warning");
  if (status === "ok") {
    iconEl.textContent = "✅";
    iconEl.classList.remove("hidden");
    iconEl.classList.add("icon-ok");
  } else if (status === "yield") {
    iconEl.textContent = "⚠";
    iconEl.classList.remove("hidden");
    iconEl.classList.add("icon-yield");
  } else if (status === "warning") {
    iconEl.textContent = "⛔";
    iconEl.classList.remove("hidden");
    iconEl.classList.add("icon-warning");
  }
};

/**
 * Compute dawn status based on run start time
 *
 * Status Logic:
 * - Warning (⛔): Start >5 minutes before dawn (darkness)
 * - Yield (⚠): Start within ±5 minutes of dawn (twilight)
 * - OK (✅): Start >5 minutes after dawn (daylight)
 *
 * IMPORTANT: Uses location timezone to ensure accurate warnings for remote locations.
 */
export const computeDawnStatus = (
  runStartMinutes: number,
  dawnData: DawnInfo | null
): StatusIconStatus => {
  if (!dawnData || !dawnData.date || !dawnData.tz) return "ok";
  if (!Number.isFinite(runStartMinutes)) return "ok";

  const { date: dawnDate, tz: dawnTz } = dawnData;

  // Get dawn time in minutes since midnight IN THE LOCATION'S TIMEZONE
  const dawnMinutes = getMinutesSinceMidnightInZone(dawnDate, dawnTz);
  if (!Number.isFinite(dawnMinutes)) return "ok";

  const diff = runStartMinutes - dawnMinutes;
  if (!Number.isFinite(diff)) return "ok";
  if (diff <= 5 && diff >= -5) return "yield";
  if (diff < -5) return "warning";
  return "ok";
};

/**
 * Compute wind chill status
 *
 * Status Logic:
 * - Warning (⛔): ≤30°F (frostbite risk)
 * - Yield (⚠): 31-40°F (cold)
 * - OK (✅): >40°F (comfortable)
 */
export const computeWindStatus = (windChillF: number | null | undefined): StatusIconStatus => {
  if (typeof windChillF !== "number") return "ok";
  if (windChillF <= 30) return "warning";
  if (windChillF <= 40) return "yield";
  return "ok";
};

/**
 * Compute precipitation probability status
 *
 * Status Logic:
 * - Warning (⛔): ≥60% (likely rain)
 * - Yield (⚠): 30-59% (possible rain)
 * - OK (✅): <30% (unlikely)
 */
export const computePrecipStatus = (pop: number | null | undefined): StatusIconStatus => {
  if (typeof pop !== "number") return "ok";
  if (pop >= 60) return "warning";
  if (pop >= 30) return "yield";
  return "ok";
};

/**
 * Compute wet bulb temperature status
 *
 * Status Logic:
 * - Warning (⛔): ≥75°F (dangerous heat/humidity)
 * - Yield (⚠): 65-74°F (hot/humid)
 * - OK (✅): <65°F (comfortable)
 */
export const computeWetBulbStatus = (wetBulbF: number | null | undefined): StatusIconStatus => {
  if (typeof wetBulbF !== "number") return "ok";
  if (wetBulbF >= 75) return "warning";
  if (wetBulbF >= 65) return "yield";
  return "ok";
};

// ============================================================================
// DOM MANAGEMENT
// ============================================================================

/**
 * Weather awareness UI elements cache
 */
let awarenessElements: AwarenessElements | null = null;

/**
 * Build awareness elements object from DOM
 */
const buildAwarenessElements = (): AwarenessElements => {
  const awMsgEl = document.getElementById("awMsg");
  return {
    awCity: document.getElementById("awCity"),
    awDawn: document.getElementById("awDawn") as HTMLTimeElement | null,
    awMsg: awMsgEl,
    awWindChill: document.getElementById("awWindChill"),
    awPoP: document.getElementById("awPoP"),
    awWetBulb: document.getElementById("awWetBulb"),
    awDawnIcon: document.getElementById("awDawnIcon"),
    awWindChillIcon: document.getElementById("awWindChillIcon"),
    awPoPIcon: document.getElementById("awPoPIcon"),
    awWetBulbIcon: document.getElementById("awWetBulbIcon"),
    awWetness: document.getElementById("awWetness"),
    awDecisionIcon: document.getElementById("awDecisionIcon"),
    awDecisionText: document.getElementById("awDecisionText"),
    useLoc: document.getElementById("useMyLocation") as HTMLButtonElement | null,
    placeInput: document.getElementById("placeQuery") as HTMLInputElement | null,
    setPlace: document.getElementById("setPlace") as HTMLButtonElement | null,
    defaultMsg: awMsgEl ? awMsgEl.textContent : null,
  };
};

/**
 * Check if DOM element is stale (disconnected)
 */
const isElementStale = (el: HTMLElement | null): boolean => {
  if (!el) return true;
  if (typeof Element !== "undefined" && el instanceof Element) {
    return !el.isConnected;
  }
  return false;
};

/**
 * Cache awareness DOM elements with staleness check
 *
 * Re-queries DOM if cache is empty or elements are disconnected.
 * This handles cases where DOM is rebuilt (e.g., hot reload).
 * Checks awMsg as representative element - if it's stale, all elements are.
 */
export const cacheAwarenessElements = (): AwarenessElements => {
  if (!awarenessElements || isElementStale(awarenessElements.awMsg)) {
    awarenessElements = buildAwarenessElements();
  }
  return awarenessElements;
};

// ============================================================================
// DISPLAY LOGIC
// ============================================================================

/**
 * Current dawn data (global state for daylight checking)
 * Stores {date: Date, tz: string} to ensure timezone-aware comparisons
 */
let currentDawnData: DawnInfo | null = null;

/**
 * Update dawn status icon
 */
export const updateDawnStatus = (runStartMinutes: number, dawnData: DawnInfo | null): void => {
  const els = cacheAwarenessElements();
  if (!els?.awDawnIcon) return;
  const status = computeDawnStatus(runStartMinutes, dawnData);
  setStatusIcon(els.awDawnIcon, status);
};

/**
 * Update awareness display with weather and location data
 *
 * Updates all weather awareness UI elements:
 * - Location city name
 * - Dawn time
 * - Wind chill, PoP, wet bulb temperature
 * - Trail wetness label and decision icon
 * - Status icons for all weather factors
 */
export const updateAwarenessDisplay = (data: AwarenessDisplayData): AwarenessDisplayResult => {
  const els = cacheAwarenessElements();
  if (!els) return {};

  const { city, dawn, windChillF, pop, wetBulbF, wetnessData, tz } = data;

  // Update city display
  if (els.awCity) {
    if (city) {
      els.awCity.textContent = city;
      els.awCity.classList.remove("verification-needed");
      els.awCity.classList.add("location-verified");
    } else {
      els.awCity.textContent = "Verify location";
      els.awCity.classList.add("verification-needed");
      els.awCity.classList.remove("location-verified");
    }
  }

  // Update dawn time
  if (els.awDawn) {
    if (dawn && dawn.date && dawn.tz) {
      els.awDawn.textContent = fmtTime12InZone(dawn.date, dawn.tz);
      els.awDawn.setAttribute("datetime", dawn.date.toISOString());
      els.awDawn.title = `Around dawn local time (${dawn.tz})`;
    } else {
      els.awDawn.textContent = "—";
      els.awDawn.removeAttribute("datetime");
      els.awDawn.removeAttribute("title");
    }
  }

  // Update weather data
  if (els.awWindChill) els.awWindChill.textContent = formatTemp(windChillF);
  if (els.awWetBulb) els.awWetBulb.textContent = formatTemp(wetBulbF);
  if (els.awPoP) {
    els.awPoP.textContent = formatPoP(pop);
    els.awPoP.title = "Probability of precip for the hour around dawn";
  }

  let wetnessInsight: WetnessInterpretation | null = null;
  let decision: string | null = null;

  const hasWetnessUi = els.awWetness || els.awDecisionText || els.awDecisionIcon || els.awMsg;
  if (hasWetnessUi) {
    wetnessInsight = interpretWetness(wetnessData);

    if (els.awWetness && wetnessInsight) {
      const tooltip =
        wetnessInsight.detail || (wetnessData?.summary ? String(wetnessData.summary) : undefined);
      if (tooltip) {
        els.awWetness.title = tooltip;
      } else {
        els.awWetness.removeAttribute("title");
      }
    }

    decision = wetnessInsight?.decision || "OK";
    if (els.awDecisionText) {
      const labelText = wetnessInsight?.label || "—";
      els.awDecisionText.textContent = labelText;
    }
    if (els.awDecisionIcon) {
      const decisionStatus: StatusIconStatus =
        decision === "Hazard" ? "warning" : decision === "Caution" ? "yield" : "ok";
      setStatusIcon(els.awDecisionIcon, decisionStatus);
    }

    if (els.awMsg) {
      els.awMsg.textContent = "";
      els.awMsg.classList.add("hidden");
    }

    // Surface latest insight for quick console inspection
    if (typeof window !== "undefined") {
      window.__latestWetnessInsight = wetnessInsight;
      window.__latestWetnessRaw = wetnessData;
    }
  }

  const schedule = typeof window !== "undefined" ? window.__latestSchedule : null;
  const scheduleStart = schedule
    ? (schedule.runStartMinutes ??
      (schedule.runStartTime ? toMinutes(schedule.runStartTime) : null))
    : null;
  const runStartMinutes = Number.isFinite(scheduleStart) ? scheduleStart : null;
  const scheduleReady = schedule && Number.isFinite(runStartMinutes);

  // Only compute dawn status when schedule is ready
  const dawnStatus: StatusIconStatus =
    scheduleReady && dawn && dawn.date && dawn.tz
      ? computeDawnStatus(runStartMinutes!, dawn)
      : "ok";
  const windStatus = computeWindStatus(windChillF);
  const precipStatus = computePrecipStatus(pop);
  const wetBulbStatus = computeWetBulbStatus(wetBulbF);

  setStatusIcon(els.awDawnIcon, dawnStatus);
  setStatusIcon(els.awWindChillIcon, windStatus);
  setStatusIcon(els.awPoPIcon, precipStatus);
  setStatusIcon(els.awWetBulbIcon, wetBulbStatus);

  // Store dawn data for daylight check (with timezone)
  currentDawnData = dawn && dawn.date && dawn.tz ? dawn : null;

  // Trigger daylight check update if function exists
  if (typeof window.updateLocationHeadlamp === "function") {
    window.updateLocationHeadlamp();
  }

  // Only update dawn status when schedule is ready
  if (scheduleReady && dawn && dawn.date && dawn.tz && runStartMinutes !== null) {
    updateDawnStatus(runStartMinutes, dawn);
  }

  return {
    wetnessInsight,
    decision,
    city: city || null,
    dawn: dawn && dawn.date && dawn.tz ? dawn : null,
    runStartMinutes: runStartMinutes || null,
    timezone: tz,
  };
};

/**
 * Show error message in awareness UI
 */
export const showAwarenessError = (message: string): void => {
  const els = cacheAwarenessElements();
  if (els?.awMsg) {
    els.awMsg.textContent = message;
    els.awMsg.classList.remove("hidden");
  }
  setStatusIcon(els?.awDawnIcon, "none");
  setStatusIcon(els?.awWindChillIcon, "none");
  setStatusIcon(els?.awPoPIcon, "none");
  setStatusIcon(els?.awWetBulbIcon, "none");
  if (els?.awDecisionIcon) {
    setStatusIcon(els.awDecisionIcon, "none");
  }
  if (els?.awDecisionText) {
    els.awDecisionText.textContent = "—";
  }
  emitAwarenessEvent("error", { message });
};

/**
 * Get current dawn data (for external access)
 */
export const getCurrentDawn = (): DawnInfo | null => currentDawnData;

/**
 * Set current dawn data (for testing)
 */
export const setCurrentDawn = (dawn: DawnInfo | null): void => {
  currentDawnData = dawn && dawn.date && dawn.tz ? dawn : null;
  if (typeof window.updateLocationHeadlamp === "function") {
    window.updateLocationHeadlamp();
  }
};

// ============================================================================
// CORE LOGIC
// ============================================================================

/**
 * Fetch all awareness data (weather, wetness, dawn)
 */
const fetchAwarenessData = async (
  lat: number,
  lon: number,
  tz: string,
  signal: AbortSignal
): Promise<AwarenessDataResult> => {
  // Fetch dawn first (returns {date, tz})
  const dawnData = await fetchDawn(lat, lon, tz, signal);

  // Parallel fetch weather & wetness with graceful degradation
  const [weatherResult, wetnessResult] = await Promise.allSettled([
    fetchWeatherAround(lat, lon, dawnData.date, tz),
    fetchWetnessInputs(lat, lon, dawnData.date, tz),
  ]);

  const weather: WeatherData =
    weatherResult.status === "fulfilled"
      ? weatherResult.value
      : {
          windChillF: null,
          pop: null,
          wetBulbF: null,
          tempF: null,
          windMph: null,
          weatherCode: null,
          snowfall: null,
          isSnow: false,
        };

  const wetnessInfo: WetnessData | null =
    wetnessResult.status === "fulfilled" ? wetnessResult.value : null;

  // Log any partial failures
  if (weatherResult.status === "rejected") {
    console.warn("Weather fetch failed:", weatherResult.reason);
  }
  if (wetnessResult.status === "rejected") {
    console.warn("Wetness fetch failed:", wetnessResult.reason);
  }

  return { dawnData, weather, wetnessInfo };
};

/**
 * Refresh weather awareness data
 *
 * Main orchestration function that:
 * 1. Fetches dawn time for location
 * 2. Fetches weather and wetness data in parallel
 * 3. Optionally refines city name via reverse geocoding
 * 4. Updates display with all data
 * 5. Emits ready event
 */
export const refreshAwareness = async (
  lat: number,
  lon: number,
  city = "",
  tz = defaultTz
): Promise<void> => {
  const controller = new AbortController();
  const signal = controller.signal;

  // Timeout after 10 seconds to prevent hanging requests
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const { dawnData, weather, wetnessInfo } = await fetchAwarenessData(lat, lon, tz, signal);

    // Only refine city name if it looks incomplete (no comma = single component)
    // Skip refinement if city is already formatted (e.g., "Boulder, CO, US")
    let displayCity = city;
    const needsRefinement =
      displayCity &&
      !displayCity.includes(",") &&
      displayCity.length > 0 &&
      !displayCity.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/); // Skip if it's coordinates (handles southern hemisphere)

    if (needsRefinement) {
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
        console.warn("City refinement failed:", error);
      }
    }

    // Update display with all data (handles null values gracefully)
    const displayResult = updateAwarenessDisplay({
      city: displayCity || formatCoordinates(lat, lon),
      dawn: dawnData,
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

    emitAwarenessEvent("ready", {
      city: displayResult?.city || displayCity || formatCoordinates(lat, lon),
      label: displayResult?.wetnessInsight?.label ?? null,
      decision: displayResult?.decision ?? null,
      dawn: dawnData?.date?.toISOString() ?? null,
    });
  } catch (error) {
    if (isError(error) && error.name === "AbortError") {
      console.error("Awareness refresh aborted:", error);
      showAwarenessError("Request timed out");
    } else {
      console.error("Awareness refresh failed:", error);
      showAwarenessError("Unable to load weather data");
    }
  } finally {
    // Clean up timeout whether request succeeds or fails
    clearTimeout(timeoutId);
  }
};

// ============================================================================
// USER INTERACTION HANDLERS
// ============================================================================

/**
 * Handle "Use my location" button click
 *
 * Flow:
 * 1. Request browser geolocation permission
 * 2. Get coordinates
 * 3. Reverse geocode to get city name
 * 4. Save location to localStorage
 * 5. Refresh awareness data
 */
export const handleUseMyLocation = async (): Promise<void> => {
  const els = cacheAwarenessElements();
  if (!els) return;

  try {
    if (!navigator.geolocation) {
      showAwarenessError("Geolocation not supported.");
      emitAwarenessEvent("location-error", {
        message: "Geolocation not supported.",
      });
      return;
    }

    if (els.awMsg) {
      els.awMsg.textContent = "Getting location…";
      els.awMsg.classList.remove("hidden");
    }
    emitAwarenessEvent("location-requested");

    const coords = await getCurrentLocation();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let label: string;
    try {
      const info = await reverseGeocode(coords.lat, coords.lon);
      label = info.city || formatCoordinates(coords.lat, coords.lon);
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      label = formatCoordinates(coords.lat, coords.lon);
    }

    Storage.saveWeatherLocation({
      lat: coords.lat,
      lon: coords.lon,
      city: label,
      tz,
    });

    try {
      await refreshAwareness(coords.lat, coords.lon, label, tz);
      emitAwarenessEvent("location-updated", {
        city: label,
        lat: coords.lat,
        lon: coords.lon,
      });
    } catch (error) {
      // refreshAwareness handles its own error display, but we still emit the event
      console.warn("Failed to refresh awareness after location update:", error);
      emitAwarenessEvent("location-updated", {
        city: label,
        lat: coords.lat,
        lon: coords.lon,
      });
    }
  } catch (error) {
    console.warn("Location access failed:", error);
    showAwarenessError("Location denied.");
    emitAwarenessEvent("location-denied", {
      message: getErrorMessage(error, "Location denied."),
    });
  }
};

/**
 * Handle location search
 *
 * Flow:
 * 1. Forward geocode query to coordinates
 * 2. Save location to localStorage
 * 3. Refresh awareness data
 */
export const handleLocationSearch = async (query: string | null | undefined): Promise<void> => {
  const trimmed = query?.trim();
  if (!trimmed) return;

  showAwarenessError("Searching…");
  emitAwarenessEvent("search-started", { query: trimmed });

  let location: Coordinates & LocationInfo;
  try {
    location = await geocodePlace(trimmed);
  } catch (error) {
    console.warn("Location search failed:", error);
    const errorMessage = getErrorMessage(error);
    const message =
      errorMessage === "no results" ? "Location not found" : "Unable to search location";
    showAwarenessError(message);
    emitAwarenessEvent("search-error", { message });
    return;
  }

  Storage.saveWeatherLocation({
    lat: location.lat,
    lon: location.lon,
    city: location.city,
    tz: location.tz,
  });

  try {
    await refreshAwareness(location.lat, location.lon, location.city, location.tz || defaultTz);
    emitAwarenessEvent("location-updated", {
      city: location.city,
      lat: location.lat,
      lon: location.lon,
    });
  } catch (error) {
    // refreshAwareness handles its own error display, but we still emit the event
    console.warn("Failed to refresh awareness after location search:", error);
    emitAwarenessEvent("location-updated", {
      city: location.city,
      lat: location.lat,
      lon: location.lon,
    });
  }

  const els = cacheAwarenessElements();
  if (els?.placeInput) {
    els.placeInput.value = "";
  }
};

/**
 * Initialize awareness on app startup
 *
 * Initialization Fallback Chain:
 * 1. Try saved location from localStorage
 * 2. Try browser geolocation (silent, no UI prompt)
 * 3. Skip initialization (user must click "Use my location")
 */
export const initializeAwareness = async (): Promise<void> => {
  const saved = Storage.loadWeatherLocation();

  if (saved && validateCoordinates(saved.lat, saved.lon)) {
    // Use saved location
    emitAwarenessEvent("init", { source: "storage" });
    try {
      await refreshAwareness(saved.lat, saved.lon, saved.city, saved.tz);
      emitAwarenessEvent("ready", { source: "storage" });
    } catch (error) {
      console.error("[Awareness] Failed to refresh from storage:", error);
      emitAwarenessEvent("error", { message: getErrorMessage(error) });
      throw error;
    }
  } else if (navigator.geolocation) {
    // Try to get current location silently
    try {
      const coords = await getCurrentLocation();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      try {
        const info = await reverseGeocode(coords.lat, coords.lon);
        const label = info.city || formatCoordinates(coords.lat, coords.lon);

        Storage.saveWeatherLocation({
          lat: coords.lat,
          lon: coords.lon,
          city: label,
          tz,
        });
        emitAwarenessEvent("init", { source: "geolocation" });
        await refreshAwareness(coords.lat, coords.lon, label, tz);
        emitAwarenessEvent("ready", { source: "geolocation" });
      } catch (error) {
        console.warn("Silent reverse geocoding failed:", error);
        const fallback = formatCoordinates(coords.lat, coords.lon);
        Storage.saveWeatherLocation({
          lat: coords.lat,
          lon: coords.lon,
          city: fallback,
          tz: defaultTz,
        });
        emitAwarenessEvent("init", { source: "geolocation-fallback" });
        await refreshAwareness(coords.lat, coords.lon, fallback, defaultTz);
        emitAwarenessEvent("ready", { source: "geolocation-fallback" });
      }
    } catch (error) {
      // Silent failure - don't show error message on startup
      console.warn("Silent location detection failed:", error);
      emitAwarenessEvent("init", { source: "geolocation-failed" });
    }
  } else {
    emitAwarenessEvent("init", { source: "unsupported" });
    emitAwarenessEvent("ready", { source: "unsupported" });
  }
};

/**
 * Setup awareness event listeners
 *
 * Attaches handlers to:
 * - "Use my location" button
 * - Location search input (Enter key)
 * - Location search button
 */
export const setupAwarenessListeners = (): void => {
  const els = cacheAwarenessElements();
  if (!els) return;

  // Use my location button
  if (els.useLoc) {
    els.useLoc.addEventListener("click", handleUseMyLocation);
  }

  // Location search
  if (els.placeInput) {
    els.placeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLocationSearch(els.placeInput?.value);
      }
    });
  }

  if (els.setPlace) {
    els.setPlace.addEventListener("click", () => {
      handleLocationSearch(els.placeInput?.value);
    });
  }
};
