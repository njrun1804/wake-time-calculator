import test from "node:test";
import assert from "node:assert/strict";

import {
  cacheElements,
  createInitialState,
  updateBreakfastMinutes,
  updateLocationWithTravel,
  recalculateSchedule,
  updateDisplay,
  updateLocationHeadlamp,
  loadSavedValues,
  saveFormValues,
  WakeTimeApp,
  type AppState,
  type AppElements,
} from "../../../src/app/main.js";
import { defaults, storageKeys } from "../../../src/lib/constants.js";
import { Storage } from "../../../src/lib/storage.js";

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
}

// Mock DOM elements
function createMockElement(tag: string, id?: string): HTMLElement {
  const element = {
    id: id || "",
    tagName: tag.toUpperCase(),
    value: "",
    textContent: "",
    checked: false,
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
    },
    addEventListener: () => {},
    selectedOptions: [] as HTMLOptionElement[],
    dataset: {} as DOMStringMap,
  } as unknown as HTMLElement;

  if (tag === "select") {
    (element as unknown as HTMLSelectElement).selectedOptions = [];
  }

  return element;
}

function createMockOption(value: string, travel?: string): HTMLOptionElement {
  const option = {
    value,
    dataset: { travel: travel || "0" },
  } as HTMLOptionElement;
  return option;
}

// Mock document
const mockDocument = {
  getElementById: (id: string) => {
    const elements: Record<string, HTMLElement> = {};
    return elements[id] || null;
  },
  querySelectorAll: () => [],
  readyState: "complete" as DocumentReadyState,
  addEventListener: () => {},
};

// Mock window
const mockWindow = {
  __latestSchedule: undefined as { runStartMinutes?: number; runStartTime?: string } | undefined,
  updateLocationHeadlamp: undefined as (() => void) | undefined,
};

test.beforeEach(() => {
  // Reset localStorage
  const mockStorage = new MockLocalStorage();
  (global as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;

  // Reset document
  (global as unknown as { document: typeof mockDocument }).document = mockDocument as unknown as Document;

  // Reset window
  (global as unknown as { window: typeof mockWindow }).window = mockWindow as unknown as Window;
  mockWindow.__latestSchedule = undefined;
  mockWindow.updateLocationHeadlamp = undefined;
});

// ============================================================================
// STATE MANAGEMENT TESTS
// ============================================================================

test("createInitialState returns default state", () => {
  const state = createInitialState();

  assert.equal(state.meeting, defaults.firstMeeting);
  assert.equal(state.runMinutes, defaults.run);
  assert.equal(state.travelMinutes, defaults.travel);
  assert.equal(state.breakfastMinutes, defaults.breakfast);
  assert.equal(state.location, defaults.location);
});

test("updateBreakfastMinutes updates state with normalized value", () => {
  const state = createInitialState();
  const newState = updateBreakfastMinutes(state, 30);

  assert.equal(newState.breakfastMinutes, 30);
  assert.notEqual(newState, state); // Should return new object
});

test("updateBreakfastMinutes normalizes NaN to 0", () => {
  const state = createInitialState();
  const newState = updateBreakfastMinutes(state, Number.NaN);

  assert.equal(newState.breakfastMinutes, 0);
});

test("updateBreakfastMinutes normalizes Infinity to 0", () => {
  const state = createInitialState();
  const newState = updateBreakfastMinutes(state, Number.POSITIVE_INFINITY);

  assert.equal(newState.breakfastMinutes, 0);
});

test("updateLocationWithTravel updates location and travel from option", () => {
  const state = createInitialState();
  const mockSelect = createMockElement("select") as HTMLSelectElement;
  const option = createMockOption("test-location", "20");
  mockSelect.selectedOptions = [option];

  const newState = updateLocationWithTravel(state, "test-location", mockSelect);

  assert.equal(newState.location, "test-location");
  assert.equal(newState.travelMinutes, 20);
});

test("updateLocationWithTravel uses 0 travel when option missing", () => {
  const state = createInitialState();
  const mockSelect = createMockElement("select") as HTMLSelectElement;
  mockSelect.selectedOptions = [];

  const newState = updateLocationWithTravel(state, "test-location", mockSelect);

  assert.equal(newState.location, "test-location");
  assert.equal(newState.travelMinutes, 0);
});

test("updateLocationWithTravel uses 0 travel when dataset.travel missing", () => {
  const state = createInitialState();
  const mockSelect = createMockElement("select") as HTMLSelectElement;
  const option = createMockOption("test-location");
  delete option.dataset.travel;
  mockSelect.selectedOptions = [option];

  const newState = updateLocationWithTravel(state, "test-location", mockSelect);

  assert.equal(newState.travelMinutes, 0);
});

test("recalculateSchedule computes schedule from state", () => {
  const state: AppState = {
    meeting: "08:30",
    runMinutes: 45,
    travelMinutes: 15,
    breakfastMinutes: 20,
    location: "test-location",
  };

  const result = recalculateSchedule(state);

  assert.equal(result.wakeTime, "06:25");
  assert.equal(result.wakeTime12, "6:25 AM");
  assert.equal(result.totalMinutes, 125);
  assert.equal(result.previousDay, false);
  assert.equal(result.runStartTime12, "6:45 AM");
});

test("recalculateSchedule handles previous day rollover", () => {
  const state: AppState = {
    meeting: "05:00",
    runMinutes: 180,
    travelMinutes: 60,
    breakfastMinutes: 45,
    location: "test-location",
  };

  const result = recalculateSchedule(state);

  assert.equal(result.previousDay, true);
  assert.ok(result.wakeTime12.includes("PM"));
});

// ============================================================================
// DOM OPERATIONS TESTS
// ============================================================================

test("cacheElements returns element references", () => {
  const form = createMockElement("form", "wakeForm");
  const firstMeeting = createMockElement("select", "firstMeeting");
  const runMinutes = createMockElement("input", "runMinutes");
  const runLocation = createMockElement("select", "runLocation");
  const travelMinutes = createMockElement("input", "travelMinutes");
  const breakfastHidden = createMockElement("input", "breakfastMinutes");
  const chosenWake = createMockElement("div", "chosenWake");
  const prevDayBadge = createMockElement("div", "prevDayBadge");
  const latestWake = createMockElement("div", "latestWake");

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        wakeForm: form,
        firstMeeting,
        runMinutes,
        runLocation,
        travelMinutes,
        breakfastMinutes: breakfastHidden,
        chosenWake,
        prevDayBadge,
        latestWake,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements = cacheElements();

  assert.notEqual(elements.form, null);
  assert.notEqual(elements.firstMeeting, null);
  assert.notEqual(elements.runMinutes, null);
  assert.notEqual(elements.chosenWake, null);
});

test("cacheElements handles missing elements", () => {
  const mockDoc = {
    getElementById: () => null,
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements = cacheElements();

  assert.equal(elements.form, null);
  assert.equal(elements.firstMeeting, null);
});

test("updateDisplay updates window schedule and DOM elements", () => {
  const chosenWake = createMockElement("div", "chosenWake");
  const prevDayBadge = createMockElement("div", "prevDayBadge");
  const latestWake = createMockElement("div", "latestWake");

  const elements: AppElements = {
    form: null,
    firstMeeting: null,
    runMinutes: null,
    runLocation: null,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake,
    prevDayBadge,
    latestWake,
  };

  const result = {
    wakeTime: "06:25",
    wakeTime12: "6:25 AM",
    totalMinutes: 125,
    previousDay: false,
    runStartTime: "06:45",
    runStartTime12: "6:45 AM",
    latestWakeTime: "06:05",
    latestWakeTime12: "6:05 AM",
    durations: {
      prep: 45,
      prepBeforeRun: 20,
      run: 45,
      travel: 15,
      breakfast: 20,
    },
  };

  updateDisplay(elements, result);

  assert.equal(chosenWake.textContent, "6:25 AM");
  assert.equal(latestWake.textContent, "6:05 AM");
  assert.notEqual(mockWindow.__latestSchedule, undefined);
  if (mockWindow.__latestSchedule) {
    assert.equal(mockWindow.__latestSchedule.runStartTime, "06:45");
  }
});

test("updateDisplay handles previous day badge visibility", () => {
  const prevDayBadge = createMockElement("div", "prevDayBadge");
  let hiddenClassAdded = false;
  let hiddenClassRemoved = false;

  prevDayBadge.classList = {
    add: (className: string) => {
      if (className === "hidden") hiddenClassAdded = true;
    },
    remove: (className: string) => {
      if (className === "hidden") hiddenClassRemoved = true;
    },
    contains: () => false,
  } as DOMTokenList;

  const elements: AppElements = {
    form: null,
    firstMeeting: null,
    runMinutes: null,
    runLocation: null,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge,
    latestWake: null,
  };

  // Test with previousDay = true
  updateDisplay(elements, {
    wakeTime: "23:30",
    wakeTime12: "11:30 PM",
    totalMinutes: 125,
    previousDay: true,
    runStartTime: "00:15",
    runStartTime12: "12:15 AM",
    latestWakeTime: "23:55",
    latestWakeTime12: "11:55 PM",
    durations: {
      prep: 45,
      prepBeforeRun: 20,
      run: 45,
      travel: 15,
      breakfast: 20,
    },
  });

  assert.equal(hiddenClassRemoved, true);

  // Reset
  hiddenClassRemoved = false;
  hiddenClassAdded = false;

  // Test with previousDay = false
  updateDisplay(elements, {
    wakeTime: "06:25",
    wakeTime12: "6:25 AM",
    totalMinutes: 125,
    previousDay: false,
    runStartTime: "06:45",
    runStartTime12: "6:45 AM",
    latestWakeTime: "06:05",
    latestWakeTime12: "6:05 AM",
    durations: {
      prep: 45,
      prepBeforeRun: 20,
      run: 45,
      travel: 15,
      breakfast: 20,
    },
  });

  assert.equal(hiddenClassAdded, true);
});

test("updateDisplay handles null elements gracefully", () => {
  const elements: AppElements = {
    form: null,
    firstMeeting: null,
    runMinutes: null,
    runLocation: null,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const result = {
    wakeTime: "06:25",
    wakeTime12: "6:25 AM",
    totalMinutes: 125,
    previousDay: false,
    runStartTime: "06:45",
    runStartTime12: "6:45 AM",
    latestWakeTime: "06:05",
    latestWakeTime12: "6:05 AM",
    durations: {
      prep: 45,
      prepBeforeRun: 20,
      run: 45,
      travel: 15,
      breakfast: 20,
    },
  };

  // Should not throw
  updateDisplay(elements, result);
});

// ============================================================================
// TIME FORMAT VALIDATION TESTS (tested indirectly through loadSavedValues)
// ============================================================================

test("loadSavedValues validates time format through isValidTimeFormat", () => {
  // Test valid formats are accepted
  localStorage.setItem(storageKeys.firstMeeting, "09:00");
  
  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form: null,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  const newState = loadSavedValues(elements, state, (s) => s, () => {});

  assert.equal(newState.meeting, "09:00");
});

// ============================================================================
// LOAD SAVED VALUES TESTS
// ============================================================================

test("loadSavedValues loads valid saved meeting time", () => {
  localStorage.setItem(storageKeys.firstMeeting, "09:00");

  const form = createMockElement("form");
  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  const newState = loadSavedValues(
    elements,
    state,
    (s) => s, // syncTravelFn
    () => {} // setBreakfastFn
  );

  assert.equal(newState.meeting, "09:00");
  assert.equal(firstMeeting.value, "09:00");
});

test("loadSavedValues rejects invalid meeting time format", () => {
  localStorage.setItem(storageKeys.firstMeeting, "invalid-time");

  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form: null,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  const newState = loadSavedValues(
    elements,
    state,
    (s) => s,
    () => {}
  );

  // Should use default when invalid
  assert.equal(newState.meeting, defaults.firstMeeting);
  assert.equal(firstMeeting.value, defaults.firstMeeting);
});

test("loadSavedValues loads run minutes when not zero", () => {
  localStorage.setItem(storageKeys.run, "45");

  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;
  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form: null,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  const newState = loadSavedValues(
    elements,
    state,
    (s) => s,
    () => {}
  );

  assert.equal(newState.runMinutes, 45);
  assert.equal(runMinutes.value, "45");
});

test("loadSavedValues ignores run minutes when zero", () => {
  localStorage.setItem(storageKeys.run, "0");

  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;
  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form: null,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  const newState = loadSavedValues(
    elements,
    state,
    (s) => s,
    () => {}
  );

  // Should keep default when saved value is "0"
  assert.equal(newState.runMinutes, defaults.run);
});

test("loadSavedValues loads breakfast minutes", () => {
  localStorage.setItem(storageKeys.breakfast, "30");

  let setBreakfastCalled = false;
  let setBreakfastValue = 0;

  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form: null,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  const newState = loadSavedValues(
    elements,
    state,
    (s) => s,
    (value) => {
      setBreakfastCalled = true;
      setBreakfastValue = value;
    }
  );

  assert.equal(newState.breakfastMinutes, 30);
  assert.equal(setBreakfastCalled, true);
  assert.equal(setBreakfastValue, 30);
});

test("loadSavedValues loads location and syncs travel", () => {
  localStorage.setItem(storageKeys.location, "test-location");

  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;
  const option = createMockOption("test-location", "25");
  runLocation.selectedOptions = [option];

  const firstMeeting = createMockElement("select", "firstMeeting") as HTMLSelectElement;
  const runMinutes = createMockElement("input", "runMinutes") as HTMLInputElement;

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        firstMeeting,
        runMinutes,
        runLocation,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const elements: AppElements = {
    form: null,
    firstMeeting,
    runMinutes,
    runLocation,
    travelMinutes: null,
    breakfastHidden: null,
    breakfastOptions: [],
    chosenWake: null,
    prevDayBadge: null,
    latestWake: null,
  };

  const state = createInitialState();
  let syncTravelCalled = false;
  const newState = loadSavedValues(
    elements,
    state,
    (s) => {
      syncTravelCalled = true;
      return updateLocationWithTravel(s, s.location, runLocation);
    },
    () => {}
  );

  assert.equal(newState.location, "test-location");
  assert.equal(newState.travelMinutes, 25);
  assert.equal(syncTravelCalled, true);
});

// ============================================================================
// SAVE FORM VALUES TESTS
// ============================================================================

test("saveFormValues saves all state values", () => {
  const state: AppState = {
    meeting: "09:00",
    runMinutes: 45,
    travelMinutes: 15,
    breakfastMinutes: 20,
    location: "test-location",
  };

  saveFormValues(state);

  assert.equal(localStorage.getItem(storageKeys.firstMeeting), "09:00");
  assert.equal(localStorage.getItem(storageKeys.run), "45");
  assert.equal(localStorage.getItem(storageKeys.travel), "15");
  assert.equal(localStorage.getItem(storageKeys.breakfast), "20");
  assert.equal(localStorage.getItem(storageKeys.location), "test-location");
});

// ============================================================================
// WAKE TIME APP CLASS TESTS
// ============================================================================

test("WakeTimeApp constructor initializes with defaults", () => {
  const app = new WakeTimeApp();

  assert.equal(app.state.meeting, defaults.firstMeeting);
  assert.equal(app.state.runMinutes, defaults.run);
  assert.equal(app.awarenessReady, false);
  assert.ok(typeof app.debouncedRecalculate === "function");
});

test("WakeTimeApp.cacheElements updates element references", () => {
  const form = createMockElement("form", "wakeForm");
  const firstMeeting = createMockElement("select", "firstMeeting");
  const runMinutes = createMockElement("input", "runMinutes");

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        wakeForm: form,
        firstMeeting,
        runMinutes,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const app = new WakeTimeApp();
  app.cacheElements();

  assert.notEqual(app.elements.form, null);
  assert.notEqual(app.elements.firstMeeting, null);
});

test("WakeTimeApp.updateState updates state and triggers save", () => {
  const app = new WakeTimeApp();
  let saveCalled = false;
  let recalculateCalled = false;

  // Mock saveAndRecalculate
  app.saveAndRecalculate = () => {
    saveCalled = true;
    recalculateCalled = true;
  };

  app.updateState({ meeting: "10:00" });

  assert.equal(app.state.meeting, "10:00");
  assert.equal(saveCalled, true);
  assert.equal(recalculateCalled, true);
});

test("WakeTimeApp.setBreakfastMinutes updates state and DOM", () => {
  const breakfastHidden = createMockElement("input", "breakfastMinutes") as HTMLInputElement;
  const breakfastOption1 = createMockElement("input") as HTMLInputElement;
  breakfastOption1.value = "0";
  const breakfastOption2 = createMockElement("input") as HTMLInputElement;
  breakfastOption2.value = "20";

  const mockDoc = {
    getElementById: (id: string) => {
      if (id === "breakfastMinutes") return breakfastHidden;
      return null;
    },
    querySelectorAll: () => [breakfastOption1, breakfastOption2] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const app = new WakeTimeApp();
  app.cacheElements();
  app.setBreakfastMinutes(20);

  assert.equal(app.state.breakfastMinutes, 20);
  assert.equal(breakfastHidden.value, "20");
  assert.equal(breakfastOption2.checked, true);
  assert.equal(breakfastOption1.checked, false);
});

test("WakeTimeApp.syncTravelWithLocation updates travel from location option", () => {
  const runLocation = createMockElement("select", "runLocation") as HTMLSelectElement;
  const travelMinutes = createMockElement("input", "travelMinutes") as HTMLInputElement;
  const option = createMockOption("test-location", "30");
  runLocation.selectedOptions = [option];

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        runLocation,
        travelMinutes,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const app = new WakeTimeApp();
  app.cacheElements();
  app.state.location = "test-location";

  const newState = app.syncTravelWithLocation(app.state);

  assert.equal(newState.travelMinutes, 30);
  assert.equal(travelMinutes.value, "30");
});

test("WakeTimeApp.recalculate computes and displays schedule", () => {
  const chosenWake = createMockElement("div", "chosenWake");
  const latestWake = createMockElement("div", "latestWake");
  const prevDayBadge = createMockElement("div", "prevDayBadge");

  const mockDoc = {
    getElementById: (id: string) => {
      const elements: Record<string, HTMLElement> = {
        chosenWake,
        latestWake,
        prevDayBadge,
      };
      return elements[id] || null;
    },
    querySelectorAll: () => [] as NodeListOf<HTMLElement>,
  };

  (global as unknown as { document: typeof mockDoc }).document = mockDoc as unknown as Document;

  const app = new WakeTimeApp();
  app.cacheElements();
  app.state = {
    meeting: "08:30",
    runMinutes: 45,
    travelMinutes: 15,
    breakfastMinutes: 20,
    location: "test-location",
  };

  // Mock updateLocationHeadlamp to avoid awareness dependency
  app.updateLocationHeadlamp = () => {};

  app.recalculate();

  assert.equal(chosenWake.textContent, "6:25 AM");
  assert.notEqual(mockWindow.__latestSchedule, undefined);
});

test("WakeTimeApp.saveValues persists state to localStorage", () => {
  const app = new WakeTimeApp();
  app.state = {
    meeting: "10:00",
    runMinutes: 60,
    travelMinutes: 20,
    breakfastMinutes: 30,
    location: "test-location",
  };

  app.saveValues();

  assert.equal(localStorage.getItem(storageKeys.firstMeeting), "10:00");
  assert.equal(localStorage.getItem(storageKeys.run), "60");
  assert.equal(localStorage.getItem(storageKeys.travel), "20");
  assert.equal(localStorage.getItem(storageKeys.breakfast), "30");
  assert.equal(localStorage.getItem(storageKeys.location), "test-location");
});
