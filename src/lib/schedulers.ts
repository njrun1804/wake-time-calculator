const defaultTimeout = 500;

const createIdleDeadline = () => ({
  didTimeout: false,
  timeRemaining: () => 0,
});

export function runWhenIdle(
  callback: (deadline: IdleDeadline | { didTimeout: boolean; timeRemaining: () => number }) => void,
  options: { timeout?: number } = {}
): number {
  const timeout = options.timeout ?? defaultTimeout;

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(callback, { timeout });
  }

  if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
    return window.setTimeout(() => {
      callback(createIdleDeadline());
    }, timeout);
  }

  // Type assertion needed: setTimeout returns different types in Node.js (NodeJS.Timeout)
  // vs Browser (number). We normalize to number for consistency with clearTimeout/cancelIdleCallback.
  return setTimeout(() => {
    callback(createIdleDeadline());
  }, timeout) as unknown as number;
}

export function cancelWhenIdle(handle: number): void {
  if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(handle);
  } else if (typeof window !== "undefined" && typeof window.clearTimeout === "function") {
    window.clearTimeout(handle);
  } else {
    clearTimeout(handle);
  }
}
