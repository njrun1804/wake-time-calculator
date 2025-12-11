import test from "node:test";
import assert from "node:assert/strict";
import { runWhenIdle, cancelWhenIdle } from "../../../src/lib/schedulers.js";

test("runWhenIdle calls callback when requestIdleCallback available", async () => {
  let callbackCalled = false;

  const mockIdleCallback = (
    cb: (deadline: IdleDeadline) => void,
    _options?: { timeout?: number }
  ): number => {
    setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => 16,
      } as IdleDeadline);
    }, 10);
    return 1;
  };

  const originalRequestIdleCallback = global.window?.requestIdleCallback;
  if (typeof global.window === "undefined") {
    global.window = {} as Window & typeof globalThis;
  }
  global.window.requestIdleCallback = mockIdleCallback;

  try {
    runWhenIdle(() => {
      callbackCalled = true;
    });

    // Wait for callback
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.equal(callbackCalled, true);
  } finally {
    if (originalRequestIdleCallback) {
      global.window.requestIdleCallback = originalRequestIdleCallback;
    }
  }
});

test("runWhenIdle falls back to setTimeout when requestIdleCallback unavailable", async () => {
  let callbackCalled = false;

  // Remove requestIdleCallback
  const originalRequestIdleCallback = global.window?.requestIdleCallback;
  if (typeof global.window === "undefined") {
    global.window = {} as Window & typeof globalThis;
  }
  delete (global.window as { requestIdleCallback?: typeof window.requestIdleCallback })
    .requestIdleCallback;

  try {
    runWhenIdle(() => {
      callbackCalled = true;
    });

    // Wait for callback
    await new Promise((resolve) => setTimeout(resolve, 600));

    assert.equal(callbackCalled, true);
  } finally {
    if (originalRequestIdleCallback) {
      global.window.requestIdleCallback = originalRequestIdleCallback;
    }
  }
});

test("runWhenIdle provides deadline object to callback", async () => {
  let receivedDeadline: { didTimeout: boolean; timeRemaining: () => number } | null = null;

  const originalRequestIdleCallback = global.window?.requestIdleCallback;
  if (typeof global.window === "undefined") {
    global.window = {} as Window & typeof globalThis;
  }

  const mockIdleCallback = (
    cb: (deadline: IdleDeadline) => void,
    _options?: { timeout?: number }
  ): number => {
    setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => 16,
      } as IdleDeadline);
    }, 10);
    return 1;
  };

  global.window.requestIdleCallback = mockIdleCallback;

  try {
    runWhenIdle((deadline) => {
      receivedDeadline = deadline;
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.ok(receivedDeadline !== null);
    assert.equal(typeof receivedDeadline?.didTimeout, "boolean");
    assert.equal(typeof receivedDeadline?.timeRemaining, "function");
  } finally {
    if (originalRequestIdleCallback) {
      global.window.requestIdleCallback = originalRequestIdleCallback;
    }
  }
});

test("cancelWhenIdle cancels requestIdleCallback", () => {
  const mockCancelIdleCallback = (_handle: number): void => {
    // Mock implementation
  };

  const originalCancelIdleCallback = global.window?.cancelIdleCallback;
  if (typeof global.window === "undefined") {
    global.window = {} as Window & typeof globalThis;
  }
  global.window.cancelIdleCallback = mockCancelIdleCallback;

  try {
    const handle = runWhenIdle(() => {});
    // Should not throw
    cancelWhenIdle(handle);
  } finally {
    if (originalCancelIdleCallback) {
      global.window.cancelIdleCallback = originalCancelIdleCallback;
    }
  }
});

test("cancelWhenIdle falls back to clearTimeout when cancelIdleCallback unavailable", () => {
  // Remove cancelIdleCallback
  const originalCancelIdleCallback = global.window?.cancelIdleCallback;
  if (typeof global.window === "undefined") {
    global.window = {} as Window & typeof globalThis;
  }
  delete (global.window as { cancelIdleCallback?: typeof window.cancelIdleCallback })
    .cancelIdleCallback;

  try {
    const handle = runWhenIdle(() => {});
    // Should not throw
    cancelWhenIdle(handle);
  } finally {
    if (originalCancelIdleCallback) {
      global.window.cancelIdleCallback = originalCancelIdleCallback;
    }
  }
});
