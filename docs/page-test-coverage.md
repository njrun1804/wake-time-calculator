# Page-to-Test Coverage Expectations

This guide maps each HTML entry point to the JavaScript modules it loads and documents both the **current automation status** and the **target coverage** we intend to rebuild.

## Coverage Matrix

| Entry Point | Automated Coverage | Notes |
|-------------|--------------------|-------|
| `index-full-modular.html` | Playwright end-to-end (`tests/integration/wake-flow.spec.js`) on Safari (WebKit); performance probe (`tests/performance/load.spec.js`). | Default entry served via `index.html`. Covers awareness UI, weather/dawn fetches, and time allocation interactions. |
| `index-modular.html` | Playwright modular suite (`tests/integration/modular.spec.js`) and unit tests (`tests/unit/*.test.js`). | Calculator-only experience without awareness UI (Safari desktop). |

## `index-modular.html` – Core Modular Experience
- **Module entry point:** `js/main.js`, which wires calculator logic, storage helpers, constants, and modular UI bindings (form inputs, outputs, and time-allocation bars).
- **Current automation:** Playwright modular suite (`tests/integration/modular.test.js`) plus the shared unit tests in `tests/unit/`.
- **Target coverage:**
  - Maintain calculator/storage unit tests to keep math and persistence deterministic.
  - Preserve the modular Playwright journey so DOM interactions, state syncing, and time-allocation bars stay covered.
- **Notes:** This page omits weather awareness modules, so async weather/dawn scenarios are deferred to the full stack page below.

## `index-full-modular.html` – Complete Modular Stack
- **Module entry point:** `js/main-full.js`, orchestrating calculator/storage modules plus awareness modules (`js/modules/awareness/`), weather/dawn fetchers, and idle scheduling utilities.
- **Current automation:** Full-modular Playwright suite (`tests/integration/wake-flow.spec.js`) and performance probe (`tests/performance/load.spec.js`).
- **Target coverage:**
  - All tests listed for `index-modular.html` (core calculator + integration flows).
  - Additional integration/E2E scenarios covering:
    - Weather fetch success and failure paths (including cached responses).
    - Dawn-based badge updates and headlamp/daylight toggles.
    - Error messaging and retry affordances when APIs fail.
    - Storage persistence of awareness preferences and inputs.
- **Notes:** Ensure asynchronous behaviors rely on deterministic mocks (see `tests/weather.spec.js`) so CI remains stable.

## Documentation Promises & Backlog
- **MIGRATION.md:** Commits to unit, integration, and cross-browser coverage for the modular architecture. Treat these expectations as the backlog to restore rather than a description of the current repository state.
- **README.md:** Reinforces the modular testing matrix (unit + integration Playwright suites). Keep documentation honest by checking in test assets alongside any updates to these promises.

Use this document as the canonical reference when proposing new or restored test suites so reviewers know which pages each suite must exercise, and annotate future edits with the actual automation status at that time.
