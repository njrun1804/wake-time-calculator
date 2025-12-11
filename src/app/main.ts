import { defaults, storageKeys } from "../lib/constants.js";
import { Storage } from "../lib/storage.js";
import { calculateWakeTime, toMinutes, ScheduleResult } from "../lib/calculator.js";
import { runWhenIdle } from "../lib/schedulers.js";
import { updateLocationBadge, debounce } from "./ui.js";
import {
  initializeAwareness,
  setupAwarenessListeners,
  getCurrentDawn,
  updateDawnStatus,
} from "./awareness.js";

export type AppState = {
  meeting: string;
  runMinutes: number;
  travelMinutes: number;
  breakfastMinutes: number;
  location: string;
};

export type AppElements = {
  form: HTMLFormElement | null;
  firstMeeting: HTMLSelectElement | null;
  runMinutes: HTMLInputElement | null;
  runLocation: HTMLSelectElement | null;
  travelMinutes: HTMLInputElement | null;
  breakfastHidden: HTMLInputElement | null;
  breakfastOptions: HTMLInputElement[];
  chosenWake: HTMLElement | null;
  prevDayBadge: HTMLElement | null;
  latestWake: HTMLElement | null;
};

declare global {
  interface Window {
    __latestSchedule?: {
      runStartMinutes?: number;
      runStartTime?: string;
    };
    updateLocationHeadlamp?: () => void;
  }
}

export const cacheElements = (): AppElements => ({
  form: document.getElementById("wakeForm") as HTMLFormElement | null,
  firstMeeting: document.getElementById("firstMeeting") as HTMLSelectElement | null,
  runMinutes: document.getElementById("runMinutes") as HTMLInputElement | null,
  runLocation: document.getElementById("runLocation") as HTMLSelectElement | null,
  travelMinutes: document.getElementById("travelMinutes") as HTMLInputElement | null,
  breakfastHidden: document.getElementById("breakfastMinutes") as HTMLInputElement | null,
  breakfastOptions: Array.from(
    document.querySelectorAll(".breakfast-option")
  ) as HTMLInputElement[],
  chosenWake: document.getElementById("chosenWake"),
  prevDayBadge: document.getElementById("prevDayBadge"),
  latestWake: document.getElementById("latestWake"),
});

export const createInitialState = (): AppState => ({
  meeting: defaults.firstMeeting,
  runMinutes: defaults.run,
  travelMinutes: defaults.travel,
  breakfastMinutes: defaults.breakfast,
  location: defaults.location,
});

export const updateBreakfastMinutes = (state: AppState, value: number): AppState => {
  const normalized = Number.isFinite(value) ? value : 0;
  return {
    ...state,
    breakfastMinutes: normalized,
  };
};

export const updateLocationWithTravel = (
  state: AppState,
  location: string,
  runLocationEl: HTMLSelectElement | null
): AppState => {
  const option = runLocationEl?.selectedOptions[0];
  const travel = option ? parseInt(option.dataset.travel || "0", 10) || 0 : 0;

  return {
    ...state,
    location,
    travelMinutes: travel,
  };
};

export const recalculateSchedule = (state: AppState): ScheduleResult => {
  return calculateWakeTime({
    meeting: state.meeting,
    runMinutes: state.runMinutes,
    travelMinutes: state.travelMinutes,
    breakfastMinutes: state.breakfastMinutes,
  });
};

export const updateDisplay = (elements: AppElements, result: ScheduleResult): void => {
  window.__latestSchedule = {
    runStartMinutes: toMinutes(result.runStartTime),
    runStartTime: result.runStartTime,
  };

  if (elements.chosenWake) {
    elements.chosenWake.textContent = result.wakeTime12;
  }

  if (elements.prevDayBadge) {
    if (result.previousDay) {
      elements.prevDayBadge.classList.remove("hidden");
    } else {
      elements.prevDayBadge.classList.add("hidden");
    }
  }

  if (elements.latestWake) {
    elements.latestWake.textContent = result.latestWakeTime12;
  }
};

export const updateLocationHeadlamp = (state: AppState, awarenessReady: boolean): void => {
  if (!awarenessReady) return;

  const currentDawn = getCurrentDawn();
  if (!currentDawn) return;

  const result = recalculateSchedule(state);
  const runStartMinutes = toMinutes(result.runStartTime);

  updateLocationBadge(state.location, runStartMinutes, currentDawn);
  updateDawnStatus(runStartMinutes, currentDawn);
};

const isValidTimeFormat = (time: unknown): time is string => {
  if (typeof time !== "string" || !time.includes(":")) {
    return false;
  }

  const [h, m] = time.split(":");
  const hours = Number.parseInt(h, 10);
  const minutes = Number.parseInt(m, 10);

  return (
    Number.isFinite(hours) &&
    Number.isFinite(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59 &&
    h.length === 2 &&
    m.length === 2
  );
};

export const loadSavedValues = (
  elements: AppElements,
  state: AppState,
  syncTravelFn: (state: AppState) => AppState,
  setBreakfastFn: (value: number) => void
): AppState => {
  const saved = Storage.loadFormValues();
  let newState: AppState = { ...state };

  if (elements.firstMeeting) {
    const savedMeeting = saved.firstMeeting;
    if (savedMeeting && isValidTimeFormat(savedMeeting)) {
      elements.firstMeeting.value = savedMeeting;
      newState.meeting = savedMeeting;
    } else {
      if (savedMeeting) {
        console.warn(
          `Invalid meeting time format in storage: "${savedMeeting}". Using default: "${state.meeting}"`
        );
      }
      elements.firstMeeting.value = state.meeting;
      Storage.save(storageKeys.firstMeeting, state.meeting);
    }
  }

  if (saved.run && saved.run !== "0" && elements.runMinutes) {
    elements.runMinutes.value = saved.run;
    newState.runMinutes = parseInt(saved.run, 10) || 0;
  }

  const savedBreakfast = Number.parseInt(saved.breakfast, 10);
  const breakfastValue = Number.isFinite(savedBreakfast) ? savedBreakfast : state.breakfastMinutes;
  setBreakfastFn(breakfastValue);
  newState.breakfastMinutes = breakfastValue;

  if (saved.location && elements.runLocation) {
    elements.runLocation.value = saved.location;
    newState.location = saved.location;
    const syncedState = syncTravelFn(newState);
    newState = syncedState;
  }

  return newState;
};

export const saveFormValues = (state: AppState): void => {
  Storage.saveFormValues({
    firstMeeting: state.meeting,
    run: state.runMinutes,
    travel: state.travelMinutes,
    breakfast: state.breakfastMinutes,
    location: state.location,
  });
};

export class WakeTimeApp {
  elements: AppElements;
  state: AppState;
  debouncedRecalculate: () => void;
  awarenessReady: boolean;

  constructor() {
    this.elements = cacheElements();
    this.state = createInitialState();
    this.debouncedRecalculate = debounce(() => this.recalculate(), 150);
    this.awarenessReady = false;
  }

  async init(): Promise<void> {
    this.cacheElements();
    this.loadSavedValues();
    this.attachEventListeners();
    this.setupAwarenessFeatures();
    this.recalculate();

    runWhenIdle(async () => {
      try {
        await initializeAwareness();
        this.awarenessReady = true;
        this.updateLocationHeadlamp();
      } catch (error) {
        this.handleAwarenessError(error);
      }
    });
  }

  cacheElements(): void {
    this.elements = cacheElements();
  }

  loadSavedValues(): void {
    this.state = loadSavedValues(
      this.elements,
      this.state,
      (state) => this.syncTravelWithLocation(state),
      (value) => this.setBreakfastMinutes(value)
    );
  }

  attachEventListeners(): void {
    this.elements.form?.addEventListener("submit", (e) => {
      e.preventDefault();
    });

    this.elements.firstMeeting?.addEventListener("change", () => {
      if (this.elements.firstMeeting) {
        this.updateState({ meeting: this.elements.firstMeeting.value });
      }
    });

    this.elements.runMinutes?.addEventListener("input", () => {
      if (this.elements.runMinutes) {
        const value = parseInt(this.elements.runMinutes.value, 10) || 0;
        this.updateState({ runMinutes: Math.max(0, Math.min(999, value)) });
      }
    });

    this.elements.breakfastOptions.forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        const value = Number.parseInt(input.value, 10) || 0;
        this.setBreakfastMinutes(value);
        this.saveAndRecalculate();
      });
    });

    this.elements.runLocation?.addEventListener("change", () => {
      if (this.elements.runLocation) {
        const location = this.elements.runLocation.value;
        const newState = updateLocationWithTravel(
          { ...this.state, location },
          location,
          this.elements.runLocation
        );

        if (this.elements.travelMinutes) {
          this.elements.travelMinutes.value = String(newState.travelMinutes);
        }

        this.updateState(newState);
      }
    });
  }

  updateState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.saveAndRecalculate();
  }

  setupAwarenessFeatures(): void {
    setupAwarenessListeners();

    window.updateLocationHeadlamp = () => {
      this.updateLocationHeadlamp();
    };
  }

  updateLocationHeadlamp(): void {
    updateLocationHeadlamp(this.state, this.awarenessReady);
  }

  syncTravelWithLocation(state: AppState): AppState {
    const newState = updateLocationWithTravel(state, state.location, this.elements.runLocation);

    if (this.elements.travelMinutes) {
      this.elements.travelMinutes.value = String(newState.travelMinutes);
    }

    return newState;
  }

  setBreakfastMinutes(value: number): void {
    const normalized = Number.isFinite(value) ? value : 0;
    this.state.breakfastMinutes = normalized;
    if (this.elements.breakfastHidden) {
      this.elements.breakfastHidden.value = String(normalized);
    }
    this.elements.breakfastOptions.forEach((input) => {
      input.checked = Number.parseInt(input.value, 10) === normalized;
    });
  }

  saveAndRecalculate(): void {
    this.saveValues();
    this.debouncedRecalculate();
  }

  saveValues(): void {
    saveFormValues(this.state);
  }

  recalculate(): void {
    const result = recalculateSchedule(this.state);
    updateDisplay(this.elements, result);
    this.updateLocationHeadlamp();
  }

  handleAwarenessError(error: unknown): void {
    console.error("Failed to initialize awareness module", error);

    const status = document.getElementById("awMsg");
    if (status && status.textContent?.trim() === "—") {
      status.textContent = "Weather data unavailable";
    }

    const verifyButton = document.getElementById("awCity");
    verifyButton?.classList.remove("verification-needed");
    verifyButton?.classList.add("btn-disabled");
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      const app = new WakeTimeApp();
      await app.init();
    });
  } else {
    const app = new WakeTimeApp();
    app.init();
  }
}
