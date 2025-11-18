/**
 * Lightweight scheduling helpers to keep the UI responsive.
 * Provides a requestIdleCallback wrapper with a timeout fallback.
 */

const defaultTimeout = 500;

const createIdleDeadline = () => ({
  didTimeout: false,
  timeRemaining: () => 0,
});

/**
 * Run a callback when the browser is idle (or after a timeout fallback).
 * @param {Function} callback
 * @param {{ timeout?: number }} [options]
 * @returns {number}
 */
export function runWhenIdle(callback, options = {}) {
  const timeout = options.timeout ?? defaultTimeout;

  if (
    typeof window !== "undefined" &&
    typeof window.requestIdleCallback === "function"
  ) {
    return window.requestIdleCallback(callback, { timeout });
  }

  if (
    typeof window !== "undefined" &&
    typeof window.setTimeout === "function"
  ) {
    return window.setTimeout(() => {
      callback(createIdleDeadline());
    }, timeout);
  }

  return setTimeout(() => {
    callback(createIdleDeadline());
  }, timeout);
}

/**
 * Cancel an idle callback scheduled with runWhenIdle.
 * @param {number} handle
 */
export function cancelWhenIdle(handle) {
  if (
    typeof window !== "undefined" &&
    typeof window.cancelIdleCallback === "function"
  ) {
    window.cancelIdleCallback(handle);
  } else if (
    typeof window !== "undefined" &&
    typeof window.clearTimeout === "function"
  ) {
    window.clearTimeout(handle);
  } else {
    clearTimeout(handle);
  }
}
