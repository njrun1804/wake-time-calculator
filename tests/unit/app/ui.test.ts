import test from "node:test";
import assert from "node:assert/strict";

import { updateLocationBadge, debounce } from "../../../src/app/ui.js";
import { DawnInfo } from "../../../src/app/dawn.js";

// Mock document
let mockDocument: {
  getElementById: (id: string) => HTMLElement | null;
} = {
  getElementById: () => null,
};

const originalDocument = global.document;

test.beforeEach(() => {
  mockDocument = {
    getElementById: () => null,
  };
  (global as unknown as { document: typeof mockDocument }).document = mockDocument as unknown as Document;
});

test.afterEach(() => {
  (global as unknown as { document: typeof originalDocument }).document = originalDocument;
});

test("updateLocationBadge does nothing when document is undefined", () => {
  (global as unknown as { document: undefined }).document = undefined;
  // Should not throw
  updateLocationBadge("test-location", 300, null);
});

test("updateLocationBadge does nothing when badge element not found", () => {
  mockDocument.getElementById = () => null;
  // Should not throw
  updateLocationBadge("test-location", 300, null);
});

test("updateLocationBadge shows badge when daylight check needed", () => {
  let badgeText = "";
  let hiddenClassPresent = false;

  const mockBadge = {
    textContent: "",
    classList: {
      remove: (className: string) => {
        if (className === "hidden") {
          hiddenClassPresent = false;
        }
      },
      add: (className: string) => {
        if (className === "hidden") {
          hiddenClassPresent = true;
        }
      },
    },
  };

  Object.defineProperty(mockBadge, "textContent", {
    get: () => badgeText,
    set: (value: string) => {
      badgeText = value;
    },
  });

  mockDocument.getElementById = (id: string) => {
    if (id === "daylightWarning") {
      return mockBadge as unknown as HTMLElement;
    }
    return null;
  };

  // Create dawn data that would trigger daylight check
  // Run starts before dawn (at 300 minutes = 5:00 AM)
  // Dawn is at 360 minutes = 6:00 AM
  const dawnDate = new Date();
  dawnDate.setHours(6, 0, 0, 0);
  const dawnData: DawnInfo = { date: dawnDate, tz: "America/New_York" };

  updateLocationBadge("test-location", 300, dawnData);

  assert.ok(badgeText.length > 0, "Badge should have text content");
  assert.equal(hiddenClassPresent, false, "Badge should not have hidden class");
});

test("updateLocationBadge hides badge when daylight check not needed", () => {
  let hiddenClassPresent = false;

  const mockBadge = {
    textContent: "",
    classList: {
      remove: (className: string) => {
        if (className === "hidden") {
          hiddenClassPresent = false;
        }
      },
      add: (className: string) => {
        if (className === "hidden") {
          hiddenClassPresent = true;
        }
      },
    },
  };

  mockDocument.getElementById = (id: string) => {
    if (id === "daylightWarning") {
      return mockBadge as unknown as HTMLElement;
    }
    return null;
  };

  // Run starts after dawn (at 420 minutes = 7:00 AM)
  // Dawn is at 360 minutes = 6:00 AM
  const dawnDate = new Date();
  dawnDate.setHours(6, 0, 0, 0);
  const dawnData: DawnInfo = { date: dawnDate, tz: "America/New_York" };

  updateLocationBadge("test-location", 420, dawnData);

  assert.equal(hiddenClassPresent, true, "Badge should have hidden class");
});

test("updateLocationBadge hides badge when dawnData is null", () => {
  let hiddenClassPresent = false;

  const mockBadge = {
    textContent: "",
    classList: {
      remove: () => {},
      add: (className: string) => {
        if (className === "hidden") {
          hiddenClassPresent = true;
        }
      },
    },
  };

  mockDocument.getElementById = (id: string) => {
    if (id === "daylightWarning") {
      return mockBadge as unknown as HTMLElement;
    }
    return null;
  };

  updateLocationBadge("test-location", 300, null);

  assert.equal(hiddenClassPresent, true, "Badge should have hidden class when no dawn data");
});

test("updateLocationBadge hides badge when runStartMinutes is null", () => {
  let hiddenClassPresent = false;

  const mockBadge = {
    textContent: "",
    classList: {
      remove: () => {},
      add: (className: string) => {
        if (className === "hidden") {
          hiddenClassPresent = true;
        }
      },
    },
  };

  mockDocument.getElementById = (id: string) => {
    if (id === "daylightWarning") {
      return mockBadge as unknown as HTMLElement;
    }
    return null;
  };

  const dawnDate = new Date();
  dawnDate.setHours(6, 0, 0, 0);
  const dawnData: DawnInfo = { date: dawnDate, tz: "America/New_York" };

  updateLocationBadge("test-location", null, dawnData);

  assert.equal(hiddenClassPresent, true, "Badge should have hidden class when run start is null");
});

test("debounce delays function execution", () => {
  let callCount = 0;
  const func = () => {
    callCount++;
  };

  const debounced = debounce(func, 50);

  debounced();
  assert.equal(callCount, 0, "Function should not be called immediately");

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.equal(callCount, 1, "Function should be called after delay");
      resolve();
    }, 100);
  });
});

test("debounce cancels previous calls", () => {
  let callCount = 0;
  const func = () => {
    callCount++;
  };

  const debounced = debounce(func, 50);

  debounced();
  debounced();
  debounced();

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.equal(callCount, 1, "Function should only be called once after multiple rapid calls");
      resolve();
    }, 100);
  });
});

test("debounce passes arguments correctly", () => {
  let receivedArgs: unknown[] = [];
  const func = (...args: unknown[]) => {
    receivedArgs = args;
  };

  const debounced = debounce(func, 50);

  debounced("arg1", 42, { foo: "bar" });

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.deepEqual(receivedArgs, ["arg1", 42, { foo: "bar" }], "Arguments should be passed correctly");
      resolve();
    }, 100);
  });
});

test("debounce handles multiple separate calls", () => {
  let callCount = 0;
  const func = () => {
    callCount++;
  };

  const debounced = debounce(func, 50);

  debounced();

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.equal(callCount, 1, "First call should execute");
      debounced();

      setTimeout(() => {
        assert.equal(callCount, 2, "Second call should execute separately");
        resolve();
      }, 100);
    }, 100);
  });
});

test("debounce works with zero wait time", () => {
  let callCount = 0;
  const func = () => {
    callCount++;
  };

  const debounced = debounce(func, 0);

  debounced();

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.equal(callCount, 1, "Function should be called even with zero wait");
      resolve();
    }, 10);
  });
});
