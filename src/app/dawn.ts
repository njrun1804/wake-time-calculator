import { CACHE_DURATION, defaultTz, MINUTES_PER_DAY } from "../lib/constants.js";
import { fmtYMDInZone, getMinutesSinceMidnightInZone } from "../lib/time.js";

export type DawnInfo = { date: Date; tz: string };
type DawnCacheEntry = { data: Date; tz: string; time: number };

// ============================================================================
// API TYPES
// ============================================================================

interface SunriseSunsetResponse {
  status: string;
  results?: {
    dawn?: string | number; // API returns string with time_format=unix
    [key: string]: unknown;
  };
}

const dawnCache: Record<string, DawnCacheEntry> = {};
const MAX_CACHE_ENTRIES = 50;
const CLEANUP_INTERVAL = 10; // Run cleanup every N cache operations
let cacheOperationCount = 0;

/**
 * Round coordinates to 2 decimal places for cache keys.
 * This prevents GPS jitter from creating duplicate cache entries.
 */
const roundCoordForCache = (coord: number): string => coord.toFixed(2);

const cleanupDawnCache = (maxAge = CACHE_DURATION) => {
  const now = Date.now();
  const keys = Object.keys(dawnCache);

  for (const key of keys) {
    if (now - dawnCache[key].time > maxAge) {
      delete dawnCache[key];
    }
  }

  const remainingKeys = Object.keys(dawnCache);
  if (remainingKeys.length > MAX_CACHE_ENTRIES) {
    const sorted = remainingKeys.sort((a, b) => dawnCache[a].time - dawnCache[b].time);
    const toRemove = sorted.slice(0, remainingKeys.length - MAX_CACHE_ENTRIES);
    for (const key of toRemove) {
      delete dawnCache[key];
    }
  }
};

const cacheDawn = (key: string, data: Date, tz: string) => {
  // Clone the Date to prevent mutation of cached value
  dawnCache[key] = { data: new Date(data.getTime()), tz, time: Date.now() };
  cacheOperationCount++;
  // Deterministic cleanup every N operations instead of probabilistic
  if (cacheOperationCount >= CLEANUP_INTERVAL) {
    cacheOperationCount = 0;
    cleanupDawnCache();
  }
};

const getCachedDawn = (key: string, maxAge = CACHE_DURATION): DawnInfo | null => {
  const cached = dawnCache[key];
  if (cached && Date.now() - cached.time < maxAge) {
    // Clone the Date to prevent mutation of cached value
    return { date: new Date(cached.data.getTime()), tz: cached.tz };
  }
  return null;
};

export const fetchDawn = async (
  lat: number,
  lon: number,
  tz: string = defaultTz,
  signal?: AbortSignal | null
): Promise<DawnInfo> => {
  const ymd = fmtYMDInZone(new Date(Date.now() + 24 * 60 * 60 * 1000), tz);
  const key = `dawn_${roundCoordForCache(lat)}_${roundCoordForCache(lon)}_${tz}_${ymd}`;

  const cached = getCachedDawn(key);
  if (cached) return cached;

  const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=tomorrow&time_format=unix`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to fetch dawn time");

  let data: SunriseSunsetResponse;
  try {
    data = (await res.json()) as SunriseSunsetResponse;
  } catch {
    throw new Error("Failed to parse dawn API response");
  }

  // Runtime validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid dawn API response format");
  }
  if (data.status !== "OK") {
    throw new Error(`Dawn API returned status: ${data.status}`);
  }
  if (!data.results || typeof data.results !== "object") {
    throw new Error("No results in dawn API response");
  }
  const dawnEpoch = Number(data.results.dawn);
  if (!Number.isFinite(dawnEpoch)) {
    throw new Error("Invalid or missing dawn timestamp in API response");
  }
  const dawnDate = new Date(dawnEpoch * 1000);

  cacheDawn(key, dawnDate, tz);
  return { date: dawnDate, tz };
};

export const checkDaylightNeeded = (
  runStartMinutes: number | null,
  dawnData: DawnInfo | null
): { needed: boolean; message: string | null; minutesBefore?: number } => {
  if (!dawnData || !dawnData.date || !dawnData.tz || runStartMinutes === null) {
    return { needed: false, message: null };
  }

  const { date: dawnDate, tz: dawnTz } = dawnData;
  const dawnTotalMinutes = getMinutesSinceMidnightInZone(dawnDate, dawnTz);
  const minutesFromDawn = (runStartMinutes % MINUTES_PER_DAY) - dawnTotalMinutes;

  if (minutesFromDawn <= 0) {
    const minBefore = Math.abs(minutesFromDawn);
    const message =
      minBefore === 0
        ? "Check daylight (at dawn)"
        : `Check daylight (${minBefore} min before dawn)`;

    return { needed: true, message, minutesBefore: minBefore };
  }

  return { needed: false, message: null };
};

export const setTestDawn = (hours: number, minutes: number): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
