import test from "node:test";
import assert from "node:assert/strict";

import {
  isError,
  getErrorMessage,
  getDefaultTz,
  PREP_MINUTES,
  PREP_BEFORE_RUN,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  MM_TO_INCHES,
  MS_PER_HOUR,
  CACHE_DURATION,
  defaults,
  storageKeys,
  weatherStorage,
} from "../../../src/lib/constants.js";

test("isError returns true for Error instances", () => {
  assert.equal(isError(new Error("test error")), true);
  assert.equal(isError(new TypeError("type error")), true);
  assert.equal(isError(new ReferenceError("ref error")), true);
  assert.equal(isError(new SyntaxError("syntax error")), true);
});

test("isError returns false for non-Error values", () => {
  assert.equal(isError("string error"), false);
  assert.equal(isError(42), false);
  assert.equal(isError(null), false);
  assert.equal(isError(undefined), false);
  assert.equal(isError({ message: "error" }), false);
  assert.equal(isError([]), false);
  assert.equal(isError(true), false);
});

test("getErrorMessage extracts message from Error instance", () => {
  assert.equal(getErrorMessage(new Error("test error")), "test error");
  assert.equal(getErrorMessage(new TypeError("type error")), "type error");
  // Error with empty message returns fallback (empty string is falsy)
  assert.equal(getErrorMessage(new Error("")), "Unknown error");
});

test("getErrorMessage uses fallback for Error with empty message", () => {
  const error = new Error("");
  assert.equal(getErrorMessage(error, "fallback"), "fallback");
});

test("getErrorMessage extracts message from string errors", () => {
  assert.equal(getErrorMessage("string error"), "string error");
  assert.equal(getErrorMessage(""), "");
});

test("getErrorMessage uses fallback for non-string, non-Error values", () => {
  assert.equal(getErrorMessage(null), "Unknown error");
  assert.equal(getErrorMessage(undefined), "Unknown error");
  assert.equal(getErrorMessage(42), "Unknown error");
  assert.equal(getErrorMessage({}), "Unknown error");
  assert.equal(getErrorMessage([]), "Unknown error");
});

test("getErrorMessage uses custom fallback", () => {
  assert.equal(getErrorMessage(null, "Custom fallback"), "Custom fallback");
  assert.equal(getErrorMessage(42, "Custom fallback"), "Custom fallback");
  assert.equal(getErrorMessage({}, "Custom fallback"), "Custom fallback");
});

test("getDefaultTz returns a valid timezone string", () => {
  const tz = getDefaultTz();
  assert.equal(typeof tz, "string");
  assert.ok(tz.length > 0);
  // Common timezone formats
  assert.ok(
    tz.includes("/") || // America/New_York
      tz === "UTC" || // UTC
      tz.includes("GMT") || // GMT
      tz.match(/^[A-Z]{3,4}$/) // EST, PST, etc.
  );
});

test("constants have expected values", () => {
  assert.equal(PREP_MINUTES, 45);
  assert.equal(PREP_BEFORE_RUN, 20);
  assert.equal(MINUTES_PER_DAY, 1440);
  assert.equal(MINUTES_PER_HOUR, 60);
  assert.equal(MM_TO_INCHES, 25.4);
  assert.equal(MS_PER_HOUR, 3600000);
  assert.equal(CACHE_DURATION, 15 * 60 * 1000);
});

test("defaults object has expected structure", () => {
  assert.equal(defaults.firstMeeting, "08:30");
  assert.equal(defaults.run, 0);
  assert.equal(defaults.travel, 0);
  assert.equal(defaults.breakfast, 0);
  assert.equal(defaults.location, "round-town");
});

test("storageKeys object has expected structure", () => {
  assert.equal(storageKeys.firstMeeting, "wake:meeting");
  assert.equal(storageKeys.run, "wake:run");
  assert.equal(storageKeys.travel, "wake:travel");
  assert.equal(storageKeys.breakfast, "wake:breakfast");
  assert.equal(storageKeys.location, "wake:location");
});

test("weatherStorage object has expected structure", () => {
  assert.equal(weatherStorage.lat, "wake:weatherLat");
  assert.equal(weatherStorage.lon, "wake:weatherLon");
  assert.equal(weatherStorage.city, "wake:weatherCity");
  assert.equal(weatherStorage.tz, "wake:weatherTz");
});

test("getErrorMessage handles Error with null message property", () => {
  const error = new Error();
  error.message = null as unknown as string;
  // In practice, Error.message is always a string, but test edge case
  const result = getErrorMessage(error, "fallback");
  // Should use fallback since message is falsy
  assert.equal(result, "fallback");
});
