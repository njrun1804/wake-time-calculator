export const PREP_MINUTES = 45; // Fixed prep time - not user-configurable by design
export const PREP_BEFORE_RUN = 20; // Portion of prep before leaving for run
export const MINUTES_PER_DAY = 1440;
export const MINUTES_PER_HOUR = 60;
export const MM_TO_INCHES = 25.4;
export const MS_PER_HOUR = 3600000; // Milliseconds per hour (for cache keys)
export const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export type LocationOption = "round-town" | string;

export const defaults = {
  firstMeeting: "08:30",
  run: 0,
  travel: 0,
  breakfast: 0,
  location: "round-town" satisfies LocationOption,
} as const;

export const storageKeys = {
  firstMeeting: "wake:meeting", // Fixed to match test expectations
  run: "wake:run",
  travel: "wake:travel",
  breakfast: "wake:breakfast",
  location: "wake:location",
} as const;

export const weatherStorage = {
  lat: "wake:weatherLat",
  lon: "wake:weatherLon",
  city: "wake:weatherCity",
  tz: "wake:weatherTz",
} as const;

/**
 * Get the default timezone from browser settings.
 * Returns current timezone, which updates if user changes system timezone.
 */
export const getDefaultTz = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Default timezone constant (cached at module load)
 * @deprecated Use getDefaultTz() for up-to-date timezone
 */
export const defaultTz = getDefaultTz();

/**
 * Type guard to check if an unknown value is an Error instance
 * Use this in catch blocks to safely narrow error types
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extract error message from unknown error value
 * Returns a safe string representation of the error
 */
export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (isError(error)) {
    return error.message || fallback;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}
