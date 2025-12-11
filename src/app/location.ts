import { defaultTz } from "../lib/constants.js";

export type Coordinates = { lat: number; lon: number };
export type LocationInfo = { city: string; tz?: string };

// ============================================================================
// API TYPES
// ============================================================================

interface OpenMeteoGeocodingResult {
  id?: number;
  name?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  admin4_id?: number;
  timezone?: string;
  population?: number;
  postcodes?: string[];
  country_id?: number;
  country?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  city?: string;
  town?: string;
  village?: string;
  [key: string]: unknown;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
  generationtime_ms?: number;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  county?: string;
  country?: string;
  country_code?: string;
  [key: string]: unknown;
}

interface NominatimResponse {
  name?: string;
  address?: NominatimAddress;
  [key: string]: unknown;
}

const US_STATE_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

export const validateCoordinates = (lat: number, lon: number): boolean =>
  Number.isFinite(lat) &&
  Number.isFinite(lon) &&
  lat >= -90 &&
  lat <= 90 &&
  lon >= -180 &&
  lon <= 180;

export const formatCoordinates = (lat: number, lon: number): string =>
  `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

export const getCurrentLocation = (): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lon: longitude });
      },
      (error) => {
        let message = "Location access denied";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });

const dedupeParts = (parts: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  return parts.filter((part): part is string => {
    if (!part) return false;
    const key = part.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatPlaceName = (place: Record<string, unknown> = {}): string => {
  const name = place.name as string | undefined;
  const city = place.city as string | undefined;
  const town = place.town as string | undefined;
  const village = place.village as string | undefined;
  const admin1 = place.admin1 as string | undefined;
  const admin2 = place.admin2 as string | undefined;
  const state = place.state as string | undefined;
  const country = place.country as string | undefined;
  const countryCodeRaw = place.country_code as string | undefined;

  const countryCode = countryCodeRaw ? countryCodeRaw.toUpperCase() : null;
  const primary = name || city || town || village || admin2 || admin1;

  let region = admin1 || state || admin2 || null;
  if (countryCode === "US" && region) {
    region = US_STATE_ABBR[region] || region;
  }

  let countryPart: string | null = null;
  if (countryCode) {
    countryPart = countryCode;
  } else if (country && country !== region) {
    countryPart = country;
  }

  const parts = dedupeParts([primary ?? null, region, countryPart]);
  return parts.length ? parts.join(", ") : "Location";
};

export const geocodePlace = async (
  name: string
): Promise<Coordinates & { city: string; tz: string }> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) throw new Error("Failed to geocode location");

  let data: OpenMeteoGeocodingResponse;
  try {
    data = (await res.json()) as OpenMeteoGeocodingResponse;
  } catch {
    throw new Error("Failed to parse geocoding API response");
  }

  // Runtime validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid geocoding API response format");
  }
  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error("No results found for location");
  }

  const place = data.results[0];
  // Coerce to number first (some APIs return strings)
  const lat = Number(place.latitude);
  const lon = Number(place.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Invalid coordinates in geocoding response");
  }

  return {
    lat,
    lon,
    city: formatPlaceName(place),
    tz: place.timezone || defaultTz,
  };
};

const tryNominatimReverse = async (lat: number, lon: number): Promise<LocationInfo | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) return null;

    const data = (await res.json()) as NominatimResponse;
    
    // Basic validation
    if (!data || typeof data !== "object") {
      return null;
    }

    const address = (data.address && typeof data.address === "object" ? data.address : {}) as NominatimAddress;
    const formatted = formatPlaceName({
      name: address.city || address.town || address.village || (typeof data.name === "string" ? data.name : undefined),
      admin1: typeof address.state === "string" ? address.state : undefined,
      admin2: typeof address.county === "string" ? address.county : undefined,
      country: typeof address.country === "string" ? address.country : undefined,
      country_code: typeof address.country_code === "string" ? address.country_code : undefined,
    });
    return { city: formatted, tz: defaultTz };
  } catch (error) {
    console.warn("Nominatim reverse geocoding failed:", error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<LocationInfo> => {
  // Note: Open-Meteo doesn't support reverse geocoding (planned feature, no ETA)
  // Using Nominatim (OpenStreetMap) for reverse geocoding
  const nominatimResult = await tryNominatimReverse(lat, lon);
  if (nominatimResult) return nominatimResult;

  return { city: formatCoordinates(lat, lon) };
};
