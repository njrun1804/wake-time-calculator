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
  dawnCache[key] = { data, tz, time: Date.now() };
  if (Math.random() < 0.1) {
    cleanupDawnCache();
  }
};

const getCachedDawn = (key: string, maxAge = CACHE_DURATION): DawnInfo | null => {
  const cached = dawnCache[key];
  if (cached && Date.now() - cached.time < maxAge) {
    return { date: cached.data, tz: cached.tz };
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
  const key = `dawn_${lat}_${lon}_${tz}_${ymd}`;

  const cached = getCachedDawn(key);
  if (cached) return cached;

  const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=tomorrow&time_format=unix`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to fetch dawn time");

  const data = (await res.json()) as SunriseSunsetResponse;

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
