import assert from 'node:assert/strict';

/**
 * Temporarily patch a global value for the duration of a callback.
 * Restores the original value even if the callback throws.
 *
 * @template T
 * @param {keyof globalThis} key - Global property to patch
 * @param {T} value - Temporary value
 * @param {() => Promise<any> | any} callback - Work to perform while patched
 * @returns {Promise<any>} Result of the callback
 */
export const withPatchedGlobal = async (key, value, callback) => {
  const hadKey = Object.prototype.hasOwnProperty.call(globalThis, key);
  const original = globalThis[key];

  try {
    if (value === undefined) {
      delete globalThis[key];
    } else {
      globalThis[key] = value;
    }

    return await callback();
  } finally {
    if (hadKey) {
      globalThis[key] = original;
    } else {
      delete globalThis[key];
    }
  }
};

/**
 * Create a simple in-memory mock of the Web Storage API.
 * @returns {Storage}
 */
export const createMockLocalStorage = () => {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
};

/**
 * Utility to await a timeout for async timing assertions.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Assert helper for checking that async callbacks reject with a message.
 * @param {() => Promise<any>} fn - Function expected to reject
 * @param {string|RegExp} message - Expected message or pattern
 */
export const expectRejectsWithMessage = async (fn, message) => {
  await assert.rejects(fn, (error) => {
    assert.ok(error instanceof Error);
    const actual = error.message;
    if (message instanceof RegExp) {
      return message.test(actual);
    }
    return actual === message;
  });
};
