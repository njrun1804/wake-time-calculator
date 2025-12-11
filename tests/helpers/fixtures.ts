/**
 * Test fixtures with realistic data for common scenarios
 */

import { DawnInfo } from "../../src/app/dawn.js";

// ============================================================================
// WEATHER DATA FIXTURES
// ============================================================================

export interface WeatherRecord {
  date: string | null;
  rain?: number | null;
  precipitation?: number | null;
  snowfall?: number | null;
  et0?: number | null;
  maxTempF?: number | null;
  minTempF?: number | null;
  precipHours?: number | null;
}

/**
 * Dry conditions - no recent precipitation
 */
export const dryWeatherRecords: WeatherRecord[] = [
  { date: "2024-01-05", rain: 0, et0: 0.2, maxTempF: 50 },
  { date: "2024-01-06", rain: 0, et0: 0.2, maxTempF: 50 },
  { date: "2024-01-07", rain: 0, et0: 0.2, maxTempF: 50 },
];

/**
 * Light rain - recent light precipitation
 */
export const lightRainRecords: WeatherRecord[] = [
  { date: "2024-01-05", rain: 0.2, et0: 0.1, maxTempF: 45 },
  { date: "2024-01-06", rain: 0, et0: 0.15, maxTempF: 50 },
  { date: "2024-01-07", rain: 0, et0: 0.15, maxTempF: 50 },
];

/**
 * Heavy rain - recent heavy precipitation
 */
export const heavyRainRecords: WeatherRecord[] = [
  { date: "2024-01-05", rain: 1.5, precipHours: 4, et0: 0.05, maxTempF: 45 },
  { date: "2024-01-06", rain: 0.3, et0: 0.1, maxTempF: 50 },
  { date: "2024-01-07", rain: 0, et0: 0.15, maxTempF: 50 },
];

/**
 * Snow conditions - recent snowfall
 */
export const snowRecords: WeatherRecord[] = [
  { date: "2024-01-05", snowfall: 7.0, maxTempF: 28, minTempF: 20, et0: 0.1 },
  { date: "2024-01-06", snowfall: 0, maxTempF: 35, minTempF: 30, et0: 0.1 },
  { date: "2024-01-07", snowfall: 0, maxTempF: 40, minTempF: 35, et0: 0.1 },
];

/**
 * Summer conditions - high ET0, warm temps
 */
export const summerWeatherRecords: WeatherRecord[] = [
  { date: "2024-07-05", rain: 0.5, et0: 0.2, maxTempF: 80 },
  { date: "2024-07-06", rain: 0, et0: 0.25, maxTempF: 85 },
  { date: "2024-07-07", rain: 0, et0: 0.25, maxTempF: 85 },
];

/**
 * Winter conditions - low ET0, cold temps
 */
export const winterWeatherRecords: WeatherRecord[] = [
  { date: "2024-01-05", rain: 0.5, et0: 0.1, maxTempF: 40 },
  { date: "2024-01-06", rain: 0, et0: 0.1, maxTempF: 42 },
  { date: "2024-01-07", rain: 0, et0: 0.1, maxTempF: 42 },
];

// ============================================================================
// LOCATION FIXTURES
// ============================================================================

export interface LocationData {
  lat: number;
  lon: number;
  city: string;
  tz: string;
}

/**
 * New York location data
 */
export const newYorkLocation: LocationData = {
  lat: 40.7128,
  lon: -74.006,
  city: "New York, NY",
  tz: "America/New_York",
};

/**
 * Los Angeles location data
 */
export const losAngelesLocation: LocationData = {
  lat: 34.0522,
  lon: -118.2437,
  city: "Los Angeles, CA",
  tz: "America/Los_Angeles",
};

/**
 * London location data
 */
export const londonLocation: LocationData = {
  lat: 51.5074,
  lon: -0.1278,
  city: "London, UK",
  tz: "Europe/London",
};

// ============================================================================
// DAWN DATA FIXTURES
// ============================================================================

/**
 * Create dawn info for a specific time
 */
export function createDawnInfo(hours: number, minutes: number, tz = "America/New_York"): DawnInfo {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return { date, tz };
}

/**
 * Early dawn (5:30 AM)
 */
export const earlyDawn: DawnInfo = createDawnInfo(5, 30);

/**
 * Normal dawn (6:00 AM)
 */
export const normalDawn: DawnInfo = createDawnInfo(6, 0);

/**
 * Late dawn (7:00 AM)
 */
export const lateDawn: DawnInfo = createDawnInfo(7, 0);

// ============================================================================
// FORM DATA FIXTURES
// ============================================================================

export interface FormValues {
  firstMeeting: string;
  run: number;
  travel: number;
  breakfast: number;
  location: string;
}

/**
 * Default form values
 */
export const defaultFormValues: FormValues = {
  firstMeeting: "08:30",
  run: 0,
  travel: 0,
  breakfast: 0,
  location: "round-town",
};

/**
 * Typical form values
 */
export const typicalFormValues: FormValues = {
  firstMeeting: "09:00",
  run: 30,
  travel: 15,
  breakfast: 20,
  location: "round-town",
};

/**
 * Early morning form values
 */
export const earlyMorningFormValues: FormValues = {
  firstMeeting: "07:00",
  run: 45,
  travel: 20,
  breakfast: 15,
  location: "round-town",
};

// ============================================================================
// API RESPONSE FIXTURES
// ============================================================================

/**
 * Successful geocoding response
 */
export function createGeocodingResponse(location: LocationData) {
  return {
    results: [
      {
        id: 1,
        name: location.city,
        latitude: location.lat,
        longitude: location.lon,
        timezone: location.tz,
        country: "United States",
        admin1: location.city.split(",")[1]?.trim() || "",
      },
    ],
  };
}

/**
 * Successful reverse geocoding response (Open-Meteo format)
 */
export function createReverseGeocodingResponse(location: LocationData) {
  return {
    results: [
      {
        latitude: location.lat,
        longitude: location.lon,
        name: location.city,
        timezone: location.tz,
        country: "United States",
        admin1: location.city.split(",")[1]?.trim() || "",
      },
    ],
  };
}

/**
 * Successful sunrise/sunset API response
 */
export function createSunriseSunsetResponse(dawnUnixTimestamp: number) {
  return {
    status: "OK",
    results: {
      dawn: dawnUnixTimestamp,
      sunrise: dawnUnixTimestamp + 1800, // 30 minutes after dawn
      sunset: dawnUnixTimestamp + 43200, // 12 hours after dawn
    },
  };
}

/**
 * Empty geocoding response (no results)
 */
export const emptyGeocodingResponse = {
  results: [],
};

// ============================================================================
// TIME FIXTURES
// ============================================================================

/**
 * Get a date for a specific date string (YYYY-MM-DD)
 */
export function createTestDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}

/**
 * Get minutes since midnight for a specific time
 */
export function minutesSinceMidnight(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

/**
 * Common test times in minutes since midnight
 */
export const testTimes = {
  midnight: 0,
  earlyMorning: 300, // 5:00 AM
  dawn: 360, // 6:00 AM
  morning: 420, // 7:00 AM
  midMorning: 480, // 8:00 AM
  lateMorning: 540, // 9:00 AM
  noon: 720, // 12:00 PM
} as const;
