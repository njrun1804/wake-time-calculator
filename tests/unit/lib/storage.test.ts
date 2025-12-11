import test from "node:test";
import assert from "node:assert/strict";

import { Storage } from "../../../src/lib/storage.js";
import { storageKeys, weatherStorage, defaults } from "../../../src/lib/constants.js";

// Mock localStorage
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }
}

// Mock document for toast functionality
const mockDocument = {
  getElementById: (id: string) => null,
  createElement: (tag: string) => ({
    id: "",
    style: { cssText: "", display: "", opacity: "" },
    textContent: "",
  }),
  body: {
    appendChild: () => {},
  },
};

// Setup and teardown
test.beforeEach(() => {
  // Reset localStorage mock
  const mockStorage = new MockLocalStorage();
  (global as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;

  // Mock document
  (global as unknown as { document: typeof mockDocument }).document = mockDocument as unknown as Document;
});

test("Storage.save stores value as string", () => {
  const result = Storage.save("test:key", "test-value");
  assert.equal(result, true);
  assert.equal(localStorage.getItem("test:key"), "test-value");
});

test("Storage.save converts non-string values to string", () => {
  Storage.save("test:number", 42);
  assert.equal(localStorage.getItem("test:number"), "42");

  Storage.save("test:boolean", true);
  assert.equal(localStorage.getItem("test:boolean"), "true");

  Storage.save("test:object", { foo: "bar" });
  assert.equal(localStorage.getItem("test:object"), "[object Object]");
});

test("Storage.save handles quota exceeded error", () => {
  const originalSetItem = localStorage.setItem;
  let errorShown = false;

  localStorage.setItem = () => {
    const error = new Error("QuotaExceededError");
    (error as unknown as { code: number }).code = 22;
    throw error;
  };

  // Mock showToast by checking if error would be shown
  const result = Storage.save("test:key", "value");
  assert.equal(result, false);

  localStorage.setItem = originalSetItem;
});

test("Storage.save handles localStorage disabled", () => {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error("localStorage is disabled");
  };

  const result = Storage.save("test:key", "value");
  assert.equal(result, false);

  localStorage.setItem = originalSetItem;
});

test("Storage.load retrieves stored value", () => {
  localStorage.setItem("test:key", "test-value");
  const result = Storage.load("test:key");
  assert.equal(result, "test-value");
});

test("Storage.load returns defaultValue when key not found", () => {
  const result = Storage.load("nonexistent:key", "default");
  assert.equal(result, "default");
});

test("Storage.load returns null when key not found and no default", () => {
  const result = Storage.load("nonexistent:key");
  assert.equal(result, null);
});

test("Storage.load handles localStorage errors gracefully", () => {
  const originalGetItem = localStorage.getItem;
  localStorage.getItem = () => {
    throw new Error("localStorage error");
  };

  const result = Storage.load("test:key", "default");
  assert.equal(result, "default");

  localStorage.getItem = originalGetItem;
});

test("Storage.saveFormValues saves all form fields", () => {
  const values = {
    firstMeeting: "09:00",
    run: 30,
    travel: 15,
    breakfast: 20,
    location: "test-location",
  };

  Storage.saveFormValues(values);

  assert.equal(localStorage.getItem(storageKeys.firstMeeting), "09:00");
  assert.equal(localStorage.getItem(storageKeys.run), "30");
  assert.equal(localStorage.getItem(storageKeys.travel), "15");
  assert.equal(localStorage.getItem(storageKeys.breakfast), "20");
  assert.equal(localStorage.getItem(storageKeys.location), "test-location");
});

test("Storage.saveFormValues ignores undefined values", () => {
  const values = {
    firstMeeting: "09:00",
    run: undefined,
    travel: 15,
  };

  Storage.saveFormValues(values);

  assert.equal(localStorage.getItem(storageKeys.firstMeeting), "09:00");
  assert.equal(localStorage.getItem(storageKeys.travel), "15");
  // run should not be saved since it's undefined
});

test("Storage.loadFormValues loads all form fields with defaults", () => {
  // Set some values
  localStorage.setItem(storageKeys.firstMeeting, "10:00");
  localStorage.setItem(storageKeys.run, "45");

  const values = Storage.loadFormValues();

  assert.equal(values.firstMeeting, "10:00");
  assert.equal(values.run, "45");
  assert.equal(values.travel, String(defaults.travel));
  assert.equal(values.breakfast, String(defaults.breakfast));
  assert.equal(values.location, String(defaults.location));
});

test("Storage.loadFormValues uses defaults when values missing", () => {
  const values = Storage.loadFormValues();

  assert.equal(values.firstMeeting, String(defaults.firstMeeting));
  assert.equal(values.run, String(defaults.run));
  assert.equal(values.travel, String(defaults.travel));
  assert.equal(values.breakfast, String(defaults.breakfast));
  assert.equal(values.location, String(defaults.location));
});

test("Storage.saveWeatherLocation saves all weather fields", () => {
  Storage.saveWeatherLocation({
    lat: 40.7128,
    lon: -74.006,
    city: "New York",
    tz: "America/New_York",
  });

  assert.equal(localStorage.getItem(weatherStorage.lat), "40.7128");
  assert.equal(localStorage.getItem(weatherStorage.lon), "-74.006");
  assert.equal(localStorage.getItem(weatherStorage.city), "New York");
  assert.equal(localStorage.getItem(weatherStorage.tz), "America/New_York");
});

test("Storage.saveWeatherLocation saves partial fields", () => {
  Storage.saveWeatherLocation({
    lat: 40.7128,
    city: "New York",
  });

  assert.equal(localStorage.getItem(weatherStorage.lat), "40.7128");
  assert.equal(localStorage.getItem(weatherStorage.city), "New York");
  // lon and tz should not be saved
  assert.equal(localStorage.getItem(weatherStorage.lon), null);
});

test("Storage.loadWeatherLocation returns coordinates and location info", () => {
  localStorage.setItem(weatherStorage.lat, "40.7128");
  localStorage.setItem(weatherStorage.lon, "-74.006");
  localStorage.setItem(weatherStorage.city, "New York");
  localStorage.setItem(weatherStorage.tz, "America/New_York");

  const result = Storage.loadWeatherLocation();

  assert.notEqual(result, null);
  if (result) {
    assert.equal(result.lat, 40.7128);
    assert.equal(result.lon, -74.006);
    assert.equal(result.city, "New York");
    assert.equal(result.tz, "America/New_York");
  }
});

test("Storage.loadWeatherLocation returns null when coordinates invalid", () => {
  localStorage.setItem(weatherStorage.lat, "invalid");
  localStorage.setItem(weatherStorage.lon, "-74.006");

  const result = Storage.loadWeatherLocation();
  assert.equal(result, null);
});

test("Storage.loadWeatherLocation returns null when coordinates missing", () => {
  const result = Storage.loadWeatherLocation();
  assert.equal(result, null);
});

test("Storage.loadWeatherLocation uses default timezone when tz missing", () => {
  localStorage.setItem(weatherStorage.lat, "40.7128");
  localStorage.setItem(weatherStorage.lon, "-74.006");
  localStorage.setItem(weatherStorage.city, "New York");

  const result = Storage.loadWeatherLocation();

  assert.notEqual(result, null);
  if (result) {
    assert.ok(typeof result.tz === "string");
    assert.ok(result.tz.length > 0);
  }
});

test("Storage.loadWeatherLocation uses empty string for city when missing", () => {
  localStorage.setItem(weatherStorage.lat, "40.7128");
  localStorage.setItem(weatherStorage.lon, "-74.006");

  const result = Storage.loadWeatherLocation();

  assert.notEqual(result, null);
  if (result) {
    assert.equal(result.city, "");
  }
});

test("Storage.clear removes all stored keys", () => {
  // Set some values
  localStorage.setItem(storageKeys.firstMeeting, "09:00");
  localStorage.setItem(storageKeys.run, "30");
  localStorage.setItem(weatherStorage.lat, "40.7128");
  localStorage.setItem(weatherStorage.city, "New York");

  Storage.clear();

  assert.equal(localStorage.getItem(storageKeys.firstMeeting), null);
  assert.equal(localStorage.getItem(storageKeys.run), null);
  assert.equal(localStorage.getItem(weatherStorage.lat), null);
  assert.equal(localStorage.getItem(weatherStorage.city), null);
});

test("Storage.clear handles errors gracefully", () => {
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = () => {
    throw new Error("removeItem error");
  };

  // Should not throw
  Storage.clear();

  localStorage.removeItem = originalRemoveItem;
});

test("Storage.saveCache stores data with timestamp", () => {
  const data = { foo: "bar", count: 42 };
  const result = Storage.saveCache("cache:test", data);

  assert.equal(result, true);
  const stored = localStorage.getItem("cache:test");
  const timestamp = localStorage.getItem("cache:test:t");

  assert.notEqual(stored, null);
  assert.notEqual(timestamp, null);
  if (stored) {
    const parsed = JSON.parse(stored);
    assert.deepEqual(parsed, data);
  }
  if (timestamp) {
    assert.ok(Number.isFinite(Number(timestamp)));
  }
});

test("Storage.saveCache handles JSON stringify errors", () => {
  const circular: { self?: unknown } = {};
  circular.self = circular;

  const result = Storage.saveCache("cache:test", circular);
  assert.equal(result, false);
});

test("Storage.loadCache returns cached data when fresh", () => {
  const data = { foo: "bar", count: 42 };
  Storage.saveCache("cache:test", data);

  const result = Storage.loadCache<typeof data>("cache:test", 60000);

  assert.notEqual(result, null);
  if (result) {
    assert.deepEqual(result, data);
  }
});

test("Storage.loadCache returns null when cache expired", () => {
  const data = { foo: "bar" };
  Storage.saveCache("cache:test", data);

  // Set timestamp to 2 hours ago (older than maxAge of 1 hour)
  const oldTimestamp = Date.now() - 2 * 60 * 60 * 1000;
  localStorage.setItem("cache:test:t", String(oldTimestamp));

  const result = Storage.loadCache("cache:test", 60 * 60 * 1000);
  assert.equal(result, null);
});

test("Storage.loadCache returns null when cache missing", () => {
  const result = Storage.loadCache("cache:nonexistent", 60000);
  assert.equal(result, null);
});

test("Storage.loadCache returns null when timestamp invalid", () => {
  localStorage.setItem("cache:test", JSON.stringify({ foo: "bar" }));
  localStorage.setItem("cache:test:t", "invalid-timestamp");

  const result = Storage.loadCache("cache:test", 60000);
  assert.equal(result, null);
});

test("Storage.loadCache returns null when timestamp missing", () => {
  localStorage.setItem("cache:test", JSON.stringify({ foo: "bar" }));

  const result = Storage.loadCache("cache:test", 60000);
  assert.equal(result, null);
});

test("Storage.loadCache handles JSON parse errors", () => {
  localStorage.setItem("cache:test", "invalid-json");
  localStorage.setItem("cache:test:t", String(Date.now()));

  const result = Storage.loadCache("cache:test", 60000);
  assert.equal(result, null);
});

test("Storage.loadCache respects maxAge parameter", () => {
  const data = { foo: "bar" };
  Storage.saveCache("cache:test", data);

  // Set timestamp to 5 minutes ago
  const timestamp = Date.now() - 5 * 60 * 1000;
  localStorage.setItem("cache:test:t", String(timestamp));

  // Should be valid with 10 minute maxAge
  const valid = Storage.loadCache("cache:test", 10 * 60 * 1000);
  assert.notEqual(valid, null);

  // Should be expired with 1 minute maxAge
  const expired = Storage.loadCache("cache:test", 1 * 60 * 1000);
  assert.equal(expired, null);
});
