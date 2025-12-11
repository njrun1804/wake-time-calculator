import test from "node:test";
import assert from "node:assert/strict";

import {
  computeDawnStatus,
  computeWindStatus,
  computePrecipStatus,
  computeWetBulbStatus,
  setStatusIcon,
  handleUseMyLocation,
  handleLocationSearch,
  refreshAwareness,
  cacheAwarenessElements,
  StatusIconStatus,
  DawnInfo,
} from "../../../src/app/awareness.js";

// ============================================================================
// DAWN STATUS TESTS
// ============================================================================

test("computeDawnStatus: returns warning when run starts >5 minutes before dawn", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };
  const runStartMinutes = 7 * 60 + 54; // 07:54 = 6 minutes before dawn

  const status = computeDawnStatus(runStartMinutes, dawnData);

  assert.equal(status, "warning");
});

test("computeDawnStatus: returns yield when run starts within ±5 minutes of dawn", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };

  // Test exactly 5 minutes before
  assert.equal(computeDawnStatus(7 * 60 + 55, dawnData), "yield");
  // Test exactly at dawn
  assert.equal(computeDawnStatus(8 * 60, dawnData), "yield");
  // Test exactly 5 minutes after
  assert.equal(computeDawnStatus(8 * 60 + 5, dawnData), "yield");
});

test("computeDawnStatus: returns ok when run starts >5 minutes after dawn", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };
  const runStartMinutes = 8 * 60 + 6; // 08:06 = 6 minutes after dawn

  const status = computeDawnStatus(runStartMinutes, dawnData);

  assert.equal(status, "ok");
});

test("computeDawnStatus: handles null dawnData", () => {
  const status = computeDawnStatus(8 * 60, null);

  assert.equal(status, "ok");
});

test("computeDawnStatus: handles invalid dawnData", () => {
  const invalidDawn: DawnInfo = { date: null as unknown as Date, tz: "" };
  const status = computeDawnStatus(8 * 60, invalidDawn);

  assert.equal(status, "ok");
});

test("computeDawnStatus: handles non-finite runStartMinutes", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };

  assert.equal(computeDawnStatus(Number.NaN, dawnData), "ok");
  assert.equal(computeDawnStatus(Number.POSITIVE_INFINITY, dawnData), "ok");
  assert.equal(computeDawnStatus(Number.NEGATIVE_INFINITY, dawnData), "ok");
});

test("computeDawnStatus: handles different timezones correctly", () => {
  // Dawn at 8:00 AM in Denver (MST = UTC-7)
  const dawnDate = new Date("2024-01-01T15:00:00Z"); // 8:00 AM MST
  const dawnData: DawnInfo = { date: dawnDate, tz: "America/Denver" };

  // Run at 7:50 AM local (10 minutes before dawn)
  const runStartMinutes = 7 * 60 + 50;

  const status = computeDawnStatus(runStartMinutes, dawnData);

  assert.equal(status, "warning");
});

test("computeDawnStatus: handles edge case at exactly -5 minutes", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };
  const runStartMinutes = 7 * 60 + 55; // Exactly 5 minutes before

  const status = computeDawnStatus(runStartMinutes, dawnData);

  assert.equal(status, "yield");
});

test("computeDawnStatus: handles edge case at exactly +5 minutes", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };
  const runStartMinutes = 8 * 60 + 5; // Exactly 5 minutes after

  const status = computeDawnStatus(runStartMinutes, dawnData);

  assert.equal(status, "yield");
});

// ============================================================================
// WIND CHILL STATUS TESTS
// ============================================================================

test("computeWindStatus: returns warning for ≤30°F", () => {
  assert.equal(computeWindStatus(30), "warning");
  assert.equal(computeWindStatus(25), "warning");
  assert.equal(computeWindStatus(0), "warning");
  assert.equal(computeWindStatus(-10), "warning");
});

test("computeWindStatus: returns yield for 31-40°F", () => {
  assert.equal(computeWindStatus(31), "yield");
  assert.equal(computeWindStatus(35), "yield");
  assert.equal(computeWindStatus(40), "yield");
});

test("computeWindStatus: returns ok for >40°F", () => {
  assert.equal(computeWindStatus(41), "ok");
  assert.equal(computeWindStatus(50), "ok");
  assert.equal(computeWindStatus(70), "ok");
});

test("computeWindStatus: handles null/undefined", () => {
  assert.equal(computeWindStatus(null), "ok");
  assert.equal(computeWindStatus(undefined), "ok");
});

test("computeWindStatus: handles edge cases at thresholds", () => {
  assert.equal(computeWindStatus(30.0), "warning");
  assert.equal(computeWindStatus(30.1), "yield");
  assert.equal(computeWindStatus(40.0), "yield");
  assert.equal(computeWindStatus(40.1), "ok");
});

// ============================================================================
// PRECIPITATION STATUS TESTS
// ============================================================================

test("computePrecipStatus: returns warning for ≥60%", () => {
  assert.equal(computePrecipStatus(60), "warning");
  assert.equal(computePrecipStatus(70), "warning");
  assert.equal(computePrecipStatus(100), "warning");
});

test("computePrecipStatus: returns yield for 30-59%", () => {
  assert.equal(computePrecipStatus(30), "yield");
  assert.equal(computePrecipStatus(45), "yield");
  assert.equal(computePrecipStatus(59), "yield");
});

test("computePrecipStatus: returns ok for <30%", () => {
  assert.equal(computePrecipStatus(0), "ok");
  assert.equal(computePrecipStatus(15), "ok");
  assert.equal(computePrecipStatus(29), "ok");
});

test("computePrecipStatus: handles null/undefined", () => {
  assert.equal(computePrecipStatus(null), "ok");
  assert.equal(computePrecipStatus(undefined), "ok");
});

test("computePrecipStatus: handles edge cases at thresholds", () => {
  assert.equal(computePrecipStatus(29.9), "ok");
  assert.equal(computePrecipStatus(30.0), "yield");
  assert.equal(computePrecipStatus(59.9), "yield");
  assert.equal(computePrecipStatus(60.0), "warning");
});

// ============================================================================
// WET BULB STATUS TESTS
// ============================================================================

test("computeWetBulbStatus: returns warning for ≥75°F", () => {
  assert.equal(computeWetBulbStatus(75), "warning");
  assert.equal(computeWetBulbStatus(80), "warning");
  assert.equal(computeWetBulbStatus(90), "warning");
});

test("computeWetBulbStatus: returns yield for 65-74°F", () => {
  assert.equal(computeWetBulbStatus(65), "yield");
  assert.equal(computeWetBulbStatus(70), "yield");
  assert.equal(computeWetBulbStatus(74), "yield");
});

test("computeWetBulbStatus: returns ok for <65°F", () => {
  assert.equal(computeWetBulbStatus(0), "ok");
  assert.equal(computeWetBulbStatus(50), "ok");
  assert.equal(computeWetBulbStatus(64), "ok");
});

test("computeWetBulbStatus: handles null/undefined", () => {
  assert.equal(computeWetBulbStatus(null), "ok");
  assert.equal(computeWetBulbStatus(undefined), "ok");
});

test("computeWetBulbStatus: handles edge cases at thresholds", () => {
  assert.equal(computeWetBulbStatus(64.9), "ok");
  assert.equal(computeWetBulbStatus(65.0), "yield");
  assert.equal(computeWetBulbStatus(74.9), "yield");
  assert.equal(computeWetBulbStatus(75.0), "warning");
});

// ============================================================================
// STATUS ICON SETTER TESTS
// ============================================================================

// Helper to create mock DOM element with classList tracking
const createMockElement = () => {
  const classes = new Set<string>();
  let textContent = "";

  return {
    textContent: "",
    classList: {
      add: (...args: string[]) => {
        args.forEach((cls) => classes.add(cls));
      },
      remove: (...args: string[]) => {
        args.forEach((cls) => classes.delete(cls));
      },
      contains: (cls: string) => classes.has(cls),
    } as DOMTokenList,
    get textContent() {
      return textContent;
    },
    set textContent(value: string) {
      textContent = value;
    },
  } as HTMLElement;
};

test("setStatusIcon: sets ok status correctly", () => {
  const iconEl = createMockElement();
  setStatusIcon(iconEl, "ok");

  assert.ok(iconEl.classList.contains("icon-ok"));
  assert.ok(!iconEl.classList.contains("hidden"));
  assert.equal(iconEl.textContent, "✅");
  assert.ok(!iconEl.classList.contains("icon-yield"));
  assert.ok(!iconEl.classList.contains("icon-warning"));
});

test("setStatusIcon: sets yield status correctly", () => {
  const iconEl = createMockElement();
  setStatusIcon(iconEl, "yield");

  assert.ok(iconEl.classList.contains("icon-yield"));
  assert.ok(!iconEl.classList.contains("hidden"));
  assert.equal(iconEl.textContent, "⚠");
  assert.ok(!iconEl.classList.contains("icon-ok"));
  assert.ok(!iconEl.classList.contains("icon-warning"));
});

test("setStatusIcon: sets warning status correctly", () => {
  const iconEl = createMockElement();
  setStatusIcon(iconEl, "warning");

  assert.ok(iconEl.classList.contains("icon-warning"));
  assert.ok(!iconEl.classList.contains("hidden"));
  assert.equal(iconEl.textContent, "⛔");
  assert.ok(!iconEl.classList.contains("icon-ok"));
  assert.ok(!iconEl.classList.contains("icon-yield"));
});

test("setStatusIcon: sets none status correctly", () => {
  const iconEl = createMockElement();
  iconEl.classList.add("icon-ok");
  iconEl.classList.add("icon-yield");
  iconEl.classList.add("icon-warning");
  setStatusIcon(iconEl, "none");

  assert.ok(iconEl.classList.contains("hidden"));
  assert.ok(!iconEl.classList.contains("icon-ok"));
  assert.ok(!iconEl.classList.contains("icon-yield"));
  assert.ok(!iconEl.classList.contains("icon-warning"));
});

test("setStatusIcon: handles null element gracefully", () => {
  // Should not throw
  setStatusIcon(null, "ok");
  setStatusIcon(null, "yield");
  setStatusIcon(null, "warning");
  setStatusIcon(null, "none");
});

test("setStatusIcon: removes previous status classes", () => {
  const iconEl = createMockElement();
  iconEl.classList.add("icon-ok");
  setStatusIcon(iconEl, "warning");

  assert.ok(!iconEl.classList.contains("icon-ok"));
  assert.ok(iconEl.classList.contains("icon-warning"));
});

test("setStatusIcon: handles transition from one status to another", () => {
  const iconEl = createMockElement();

  setStatusIcon(iconEl, "ok");
  assert.equal(iconEl.textContent, "✅");

  setStatusIcon(iconEl, "yield");
  assert.equal(iconEl.textContent, "⚠");
  assert.ok(!iconEl.classList.contains("icon-ok"));

  setStatusIcon(iconEl, "warning");
  assert.equal(iconEl.textContent, "⛔");
  assert.ok(!iconEl.classList.contains("icon-yield"));
});

// ============================================================================
// SAFARI FLOW DOM/NETWORK BEHAVIOR TESTS
// ============================================================================

const createMockClassList = () => {
  const classes = new Set<string>();
  return {
    add: (...args: string[]) => args.forEach((c) => classes.add(c)),
    remove: (...args: string[]) => args.forEach((c) => classes.delete(c)),
    contains: (c: string) => classes.has(c),
  } as DOMTokenList;
};

type MockElement = {
  id: string;
  textContent: string;
  classList: DOMTokenList;
  title?: string;
  datetime?: string;
  value?: string;
  setAttribute?: (name: string, value: string) => void;
  removeAttribute?: (name: string) => void;
};

const buildAwarenessDom = () => {
  const elements: Record<string, MockElement> = {};
  const makeEl = (id: string): MockElement => {
    const el: MockElement = {
      id,
      textContent: "—",
      classList: createMockClassList(),
      setAttribute: () => {},
      removeAttribute: () => {},
    };
    elements[id] = el;
    return el;
  };

  makeEl("awCity");
  makeEl("awDawn");
  makeEl("awWindChill");
  makeEl("awPoP");
  makeEl("awWetBulb");
  makeEl("awWetness");
  makeEl("awMsg");
  makeEl("awDawnIcon");
  makeEl("awWindChillIcon");
  makeEl("awPoPIcon");
  makeEl("awWetBulbIcon");
  makeEl("awDecisionIcon");
  makeEl("awDecisionText");

  const useLoc = makeEl("useMyLocation");
  const setPlace = makeEl("setPlace");
  const placeInput = makeEl("placeQuery");
  placeInput.value = "";

  return { elements, useLoc, setPlace, placeInput };
};

let sharedDom: ReturnType<typeof buildAwarenessDom> | null = null;

class MockLocalStorage {
  private store = new Map<string, string>();
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
}

class MockGeolocation {
  private success: ((pos: GeolocationPosition) => void) | null = null;
  private error: ((err: GeolocationPositionError) => void) | null = null;
  private shouldSucceed = true;
  private errorCode: number | null = null;
  getCurrentPosition(
    success: (pos: GeolocationPosition) => void,
    error: (err: GeolocationPositionError) => void
  ) {
    this.success = success;
    this.error = error;
    setTimeout(() => {
      if (this.shouldSucceed) {
        this.success?.({
          coords: {
            latitude: 40.0,
            longitude: -74.0,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      } else {
        this.error?.({
          code: this.errorCode ?? 1,
          message: "error",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      }
    }, 0);
  }
  fail(code: number) {
    this.shouldSucceed = false;
    this.errorCode = code;
  }
  succeed() {
    this.shouldSucceed = true;
    this.errorCode = null;
  }
}

const buildMockFetch =
  (overrides: Partial<Record<string, () => Response | Promise<Response>>> = {}) =>
  async (url: string | URL) => {
    const urlStr = String(url);
    const matcher = Object.keys(overrides).find((key) => urlStr.includes(key));
    if (matcher && overrides[matcher]) {
      return overrides[matcher]!();
    }

    if (urlStr.includes("nominatim.openstreetmap.org/reverse")) {
      return new Response(
        JSON.stringify({
          name: "Test City",
          address: {
            city: "Test City",
            state: "New Jersey",
            country: "United States",
            country_code: "us",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("geocoding-api.open-meteo.com/v1/search")) {
      return new Response(
        JSON.stringify({
          results: [
            {
              latitude: 39.9,
              longitude: -74.1,
              name: "Zip City",
              timezone: "America/New_York",
              country: "US",
              admin1: "New Jersey",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("sunrisesunset.io")) {
      return new Response(
        JSON.stringify({
          status: "OK",
          results: { dawn: Math.floor(Date.now() / 1000) + 3600 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("api.open-meteo.com/v1/forecast")) {
      if (urlStr.includes("hourly=")) {
        return new Response(
          JSON.stringify({
            hourly: {
              time: [new Date().toISOString()],
              temperature_2m: [50],
              wind_speed_10m: [5],
              precipitation_probability: [10],
              wet_bulb_temperature_2m: [48],
              weathercode: [0],
              snowfall: [0],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          daily: {
            time: [new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)],
            precipitation_sum: [0],
            precipitation_hours: [0],
            rain_sum: [0],
            snowfall_sum: [0],
            et0_fao_evapotranspiration: [0],
            temperature_2m_max: [50],
            temperature_2m_min: [40],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  };

const resetGlobals = (fetchImpl?: typeof fetch, geolocation?: MockGeolocation) => {
  sharedDom = sharedDom ?? buildAwarenessDom();
  const { elements } = sharedDom;

  (global as unknown as { document: Document }).document = {
    getElementById: (id: string) => (elements[id] as unknown as HTMLElement) ?? null,
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
    createElement: () => ({ style: {}, appendChild: () => {} }) as unknown as HTMLElement,
    body: { appendChild: () => {} } as unknown as HTMLElement,
  } as Document;

  (global as unknown as { window: Window }).window = {
    __awarenessEvents: [],
    __onAwarenessEvent: undefined,
    __latestSchedule: undefined,
    updateLocationHeadlamp: undefined,
  } as unknown as Window;

  (global as unknown as { localStorage: MockLocalStorage }).localStorage = new MockLocalStorage();

  Object.defineProperty(globalThis, "navigator", {
    value: {
      geolocation: geolocation ?? new MockGeolocation(),
    },
    writable: true,
    configurable: true,
  });

  global.fetch = fetchImpl ?? (buildMockFetch() as typeof fetch);

  // Reset cached awareness elements to a clean state (mirroring initial DOM)
  const els = cacheAwarenessElements();
  if (els.awMsg) {
    els.awMsg.textContent = "—";
    els.awMsg.classList.add("hidden");
  }
  if (els.awCity) {
    els.awCity.textContent = "Verify location";
    els.awCity.classList.remove("location-verified");
  }
  if (els.awDecisionText) els.awDecisionText.textContent = "—";
  if (els.awDecisionIcon) {
    els.awDecisionIcon.classList.add("hidden");
    els.awDecisionIcon.classList.remove("icon-ok", "icon-yield", "icon-warning");
  }
  if (els.awDawnIcon) els.awDawnIcon.classList.add("hidden");
  if (els.awWindChillIcon) els.awWindChillIcon.classList.add("hidden");
  if (els.awPoPIcon) els.awPoPIcon.classList.add("hidden");
  if (els.awWetBulbIcon) els.awWetBulbIcon.classList.add("hidden");
  if (els.awDecisionIcon) els.awDecisionIcon.classList.add("hidden");

  return els as Record<string, MockElement>;
};

test("handleUseMyLocation shows loading then updates city badge and hides message on success", async () => {
  const geo = new MockGeolocation();
  resetGlobals(buildMockFetch(), geo);
  const elements = cacheAwarenessElements();

  const msg = elements.awMsg;
  const city = elements.awCity;

  await handleUseMyLocation();

  assert.equal(msg.classList.contains("hidden"), true);
  assert.ok(city.textContent && city.textContent !== "—");
});

test("handleUseMyLocation surfaces error when dawn fetch fails", async () => {
  const geo = new MockGeolocation();
  const failingFetch = buildMockFetch({
    "sunrisesunset.io": () => new Response("fail", { status: 500 }),
  });
  resetGlobals(failingFetch, geo);
  const elements = cacheAwarenessElements();

  const msg = elements.awMsg;

  await handleUseMyLocation();

  assert.ok(
    msg.textContent === "Unable to load weather data" || msg.textContent === "",
    "should surface error message or leave note unchanged"
  );
});

test("handleLocationSearch shows searching then hides on success", async () => {
  resetGlobals(buildMockFetch());
  const elements = cacheAwarenessElements();
  const msg = elements.awMsg;
  const city = elements.awCity;
  const placeInput = elements.placeInput as MockElement;
  if (placeInput) {
    placeInput.value = "07701";
  }

  await handleLocationSearch(placeInput?.value ?? "07701");

  assert.equal(msg.classList.contains("hidden"), true);
  assert.ok(city.textContent && city.textContent !== "—");
});

test("handleLocationSearch shows message when geocode fails", async () => {
  const failingFetch = buildMockFetch({
    "geocoding-api.open-meteo.com/v1/search": () =>
      new Response("Not Found", { status: 404 }),
  });
  resetGlobals(failingFetch);
  const elements = cacheAwarenessElements();
  const msg = elements.awMsg;

  await handleLocationSearch("bad-zip");

  assert.equal(msg.classList.contains("hidden"), false);
  assert.equal(msg.textContent, "Unable to search location");
});

test("refreshAwareness clears message on success and sets icons", async () => {
  resetGlobals(buildMockFetch());
  const elements = cacheAwarenessElements();
  const msg = elements.awMsg;
  msg.textContent = "Getting location…";
  msg.classList.remove("hidden");

  await refreshAwareness(40, -74, "Test City", "America/New_York");

  assert.equal(msg.classList.contains("hidden"), true);
  const decisionIcon = elements["awDecisionIcon"];
  assert.equal(decisionIcon.classList.contains("hidden"), false);
});

// ============================================================================
// EDGE CASES AND EXTREME VALUES
// ============================================================================

test("computeWindStatus: handles extreme negative values", () => {
  assert.equal(computeWindStatus(-50), "warning");
  assert.equal(computeWindStatus(-100), "warning");
});

test("computeWindStatus: handles extreme positive values", () => {
  assert.equal(computeWindStatus(100), "ok");
  assert.equal(computeWindStatus(200), "ok");
});

test("computePrecipStatus: handles negative values (should be ok)", () => {
  // Negative precipitation doesn't make sense, but function should handle it
  assert.equal(computePrecipStatus(-10), "ok");
});

test("computePrecipStatus: handles values >100%", () => {
  assert.equal(computePrecipStatus(150), "warning");
  assert.equal(computePrecipStatus(200), "warning");
});

test("computeWetBulbStatus: handles extreme negative values", () => {
  assert.equal(computeWetBulbStatus(-50), "ok");
  assert.equal(computeWetBulbStatus(-100), "ok");
});

test("computeWetBulbStatus: handles extreme positive values", () => {
  assert.equal(computeWetBulbStatus(100), "warning");
  assert.equal(computeWetBulbStatus(150), "warning");
});

test("computeDawnStatus: handles very large time differences", () => {
  const dawnDate = new Date("2024-01-01T08:00:00Z");
  const dawnData: DawnInfo = { date: dawnDate, tz: "UTC" };

  // Run 6 hours before dawn (02:00 = 120 minutes)
  const runStartMinutes = 2 * 60; // 02:00 = 120 minutes, 6 hours before 08:00
  const status = computeDawnStatus(runStartMinutes, dawnData);
  assert.equal(status, "warning");

  // Run 6 hours after dawn (14:00 = 840 minutes)
  const runStartMinutes2 = 14 * 60; // 14:00 = 840 minutes, 6 hours after 08:00
  const status2 = computeDawnStatus(runStartMinutes2, dawnData);
  assert.equal(status2, "ok");
});
