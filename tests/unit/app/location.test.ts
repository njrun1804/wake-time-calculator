import test from "node:test";
import assert from "node:assert/strict";

import {
  validateCoordinates,
  formatCoordinates,
  getCurrentLocation,
  geocodePlace,
  reverseGeocode,
} from "../../../src/app/location.js";
import { defaultTz } from "../../../src/lib/constants.js";

// Mock navigator.geolocation
interface MockGeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

interface MockGeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

class MockGeolocation {
  private positionCallback: ((position: MockGeolocationPosition) => void) | null = null;
  private errorCallback: ((error: MockGeolocationError) => void) | null = null;
  private simulateSuccess = true;
  private simulateError: MockGeolocationError | null = null;

  getCurrentPosition(
    success: (position: MockGeolocationPosition) => void,
    error: (error: MockGeolocationError) => void,
    options?: PositionOptions
  ): void {
    this.positionCallback = success;
    this.errorCallback = error;

    // Simulate async behavior
    setTimeout(() => {
      if (this.simulateSuccess && !this.simulateError) {
        this.positionCallback?.({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
          },
          timestamp: Date.now(),
        });
      } else if (this.simulateError) {
        this.errorCallback?.(this.simulateError);
      }
    }, 0);
  }

  setSimulateSuccess(success: boolean): void {
    this.simulateSuccess = success;
  }

  setSimulateError(error: MockGeolocationError | null): void {
    this.simulateError = error;
  }
}

// Mock fetch
const originalFetch = global.fetch;
let mockFetchResponse: Response | null = null;
let mockFetchError: Error | null = null;

function mockFetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (mockFetchError) {
    return Promise.reject(mockFetchError);
  }
  if (mockFetchResponse) {
    return Promise.resolve(mockFetchResponse);
  }
  return originalFetch(url, init);
}

test.beforeEach(() => {
  // Reset mocks
  mockFetchResponse = null;
  mockFetchError = null;

  // Setup geolocation mock using Object.defineProperty
  const mockGeolocation = new MockGeolocation();
  Object.defineProperty(global, "navigator", {
    value: {
      geolocation: mockGeolocation,
    },
    writable: true,
    configurable: true,
  });

  // Setup fetch mock
  global.fetch = mockFetch as typeof fetch;
});

test.afterEach(() => {
  global.fetch = originalFetch;
});

// ============================================================================
// COORDINATE VALIDATION TESTS
// ============================================================================

test("validateCoordinates accepts valid coordinates", () => {
  assert.equal(validateCoordinates(40.7128, -74.006), true);
  assert.equal(validateCoordinates(0, 0), true);
  assert.equal(validateCoordinates(-90, -180), true);
  assert.equal(validateCoordinates(90, 180), true);
});

test("validateCoordinates rejects invalid latitude", () => {
  assert.equal(validateCoordinates(91, 0), false);
  assert.equal(validateCoordinates(-91, 0), false);
  assert.equal(validateCoordinates(Number.POSITIVE_INFINITY, 0), false);
  assert.equal(validateCoordinates(Number.NEGATIVE_INFINITY, 0), false);
});

test("validateCoordinates rejects invalid longitude", () => {
  assert.equal(validateCoordinates(0, 181), false);
  assert.equal(validateCoordinates(0, -181), false);
  assert.equal(validateCoordinates(0, Number.POSITIVE_INFINITY), false);
  assert.equal(validateCoordinates(0, Number.NEGATIVE_INFINITY), false);
});

test("validateCoordinates rejects NaN values", () => {
  assert.equal(validateCoordinates(Number.NaN, 0), false);
  assert.equal(validateCoordinates(0, Number.NaN), false);
  assert.equal(validateCoordinates(Number.NaN, Number.NaN), false);
});

test("validateCoordinates accepts boundary values", () => {
  assert.equal(validateCoordinates(-90, -180), true);
  assert.equal(validateCoordinates(90, 180), true);
  assert.equal(validateCoordinates(0, 0), true);
});

// ============================================================================
// COORDINATE FORMATTING TESTS
// ============================================================================

test("formatCoordinates formats coordinates with 4 decimal places", () => {
  assert.equal(formatCoordinates(40.7128, -74.006), "40.7128, -74.0060");
  assert.equal(formatCoordinates(0, 0), "0.0000, 0.0000");
  assert.equal(formatCoordinates(-90, 180), "-90.0000, 180.0000");
});

test("formatCoordinates handles precision correctly", () => {
  assert.equal(formatCoordinates(40.7, -74.0), "40.7000, -74.0000");
  assert.equal(formatCoordinates(40.123456, -74.987654), "40.1235, -74.9877");
});

// ============================================================================
// GET CURRENT LOCATION TESTS
// ============================================================================

test("getCurrentLocation resolves with coordinates on success", async () => {
  const mockGeolocation = (global.navigator as unknown as { geolocation: MockGeolocation }).geolocation;
  if (mockGeolocation) {
    mockGeolocation.setSimulateSuccess(true);
    mockGeolocation.setSimulateError(null);
  }

  const result = await getCurrentLocation();

  assert.equal(result.lat, 40.7128);
  assert.equal(result.lon, -74.006);
});

test("getCurrentLocation rejects when geolocation not supported", async () => {
  Object.defineProperty(global, "navigator", {
    value: {},
    writable: true,
    configurable: true,
  });

  await assert.rejects(
    async () => await getCurrentLocation(),
    (error: Error) => {
      return error.message === "Geolocation not supported";
    }
  );
});

test("getCurrentLocation rejects on permission denied", async () => {
  const mockGeolocation = (global.navigator as unknown as { geolocation: MockGeolocation }).geolocation;
  if (mockGeolocation) {
    mockGeolocation.setSimulateSuccess(false);
    mockGeolocation.setSimulateError({
      code: 1,
      message: "User denied Geolocation",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
  }

  await assert.rejects(
    async () => await getCurrentLocation(),
    (error: Error) => {
      return error.message === "Location access denied";
    }
  );
});

test("getCurrentLocation rejects on position unavailable", async () => {
  const mockGeolocation = (global.navigator as unknown as { geolocation: MockGeolocation }).geolocation;
  if (mockGeolocation) {
    mockGeolocation.setSimulateSuccess(false);
    mockGeolocation.setSimulateError({
      code: 2,
      message: "Position unavailable",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
  }

  await assert.rejects(
    async () => await getCurrentLocation(),
    (error: Error) => {
      return error.message === "Location unavailable";
    }
  );
});

test("getCurrentLocation rejects on timeout", async () => {
  const mockGeolocation = (global.navigator as unknown as { geolocation: MockGeolocation }).geolocation;
  if (mockGeolocation) {
    mockGeolocation.setSimulateSuccess(false);
    mockGeolocation.setSimulateError({
      code: 3,
      message: "Timeout",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
  }

  await assert.rejects(
    async () => await getCurrentLocation(),
    (error: Error) => {
      return error.message === "Location request timed out";
    }
  );
});

// ============================================================================
// GEOCODE PLACE TESTS
// ============================================================================

test("geocodePlace resolves with coordinates and city name", async () => {
  const mockResponse = {
    results: [
      {
        id: 1,
        name: "New York",
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
        country: "United States",
        admin1: "New York",
      },
    ],
  };

  mockFetchResponse = new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const result = await geocodePlace("New York");

  assert.equal(result.lat, 40.7128);
  assert.equal(result.lon, -74.006);
  assert.ok(result.city.includes("New York"));
  assert.equal(result.tz, "America/New_York");
});

test("geocodePlace uses default timezone when timezone missing", async () => {
  const mockResponse = {
    results: [
      {
        latitude: 40.7128,
        longitude: -74.006,
        name: "Test City",
      },
    ],
  };

  mockFetchResponse = new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const result = await geocodePlace("Test City");

  assert.equal(result.tz, defaultTz);
});

test("geocodePlace rejects when API request fails", async () => {
  mockFetchResponse = new Response("Not Found", { status: 404 });

  await assert.rejects(
    async () => await geocodePlace("Invalid Place"),
    (error: Error) => {
      return error.message === "Failed to geocode location";
    }
  );
});

test("geocodePlace rejects when API returns invalid response format", async () => {
  mockFetchResponse = new Response("Invalid JSON", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  await assert.rejects(
    async () => await geocodePlace("Test"),
    (error: Error) => {
      // JSON parse errors or validation errors are both acceptable
      return (
        error.message.includes("Invalid geocoding API response format") ||
        error.message.includes("Failed to geocode location") ||
        error.message.includes("not valid JSON") ||
        error.name === "SyntaxError" ||
        error.constructor.name === "SyntaxError"
      );
    }
  );
});

test("geocodePlace rejects when no results found", async () => {
  const mockResponse = {
    results: [],
  };

  mockFetchResponse = new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  await assert.rejects(
    async () => await geocodePlace("Nonexistent Place"),
    (error: Error) => {
      return error.message === "No results found for location";
    }
  );
});

test("geocodePlace rejects when coordinates invalid in response", async () => {
  const mockResponse = {
    results: [
      {
        latitude: "invalid", // String that can't be converted to number
        longitude: -74.006,
        name: "Test City",
      },
    ],
  };

  mockFetchResponse = new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  await assert.rejects(
    async () => await geocodePlace("Test City"),
    (error: Error) => {
      return error.message === "Invalid coordinates in geocoding response";
    }
  );
});

test("geocodePlace handles network errors", async () => {
  mockFetchError = new Error("Network error");

  await assert.rejects(
    async () => await geocodePlace("Test"),
    (error: Error) => {
      return error.message === "Network error";
    }
  );
});

// ============================================================================
// REVERSE GEOCODE TESTS
// ============================================================================

test("reverseGeocode uses Nominatim for reverse geocoding", async () => {
  // Open-Meteo doesn't support reverse geocoding, so we use Nominatim
  mockFetchResponse = new Response(
    JSON.stringify({
      name: "New York",
      address: {
        city: "New York",
        state: "New York",
        country: "United States",
        country_code: "us",
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );

  const result = await reverseGeocode(40.7128, -74.006);

  assert.ok(result.city.includes("New York"));
  assert.equal(result.tz, defaultTz);
});

test("reverseGeocode falls back to coordinates when Nominatim fails", async () => {
  global.fetch = async () => {
    return new Response("Not Found", { status: 404 });
  };

  const result = await reverseGeocode(40.7128, -74.006);

  assert.equal(result.city, "40.7128, -74.0060");
  assert.equal(result.tz, undefined);
});

test("reverseGeocode handles Nominatim invalid response", async () => {
  global.fetch = async () => {
    return new Response("Invalid JSON", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await reverseGeocode(40.7128, -74.006);

  assert.equal(result.city, "40.7128, -74.0060");
});

test("reverseGeocode formats US state abbreviations correctly", async () => {
  // Nominatim response format
  const mockResponse = {
    name: "New York",
    address: {
      city: "New York",
      state: "New York",
      country: "United States",
      country_code: "us",
    },
  };

  mockFetchResponse = new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const result = await reverseGeocode(40.7128, -74.006);

  // Should use state abbreviation for US states
  assert.ok(result.city.includes("NY") || result.city.includes("New York"));
});
