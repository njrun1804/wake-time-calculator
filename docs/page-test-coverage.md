# Page-to-Test Coverage Expectations

This guide maps the HTML entry point to the JavaScript modules it loads and documents both the **current automation status** and the **target coverage** we intend to maintain.

## Coverage Matrix

| Entry Point | Automated Coverage | Notes |
|-------------|--------------------|-------|
| `index.html` | Playwright integration suites (`tests/integration/wake-flow.spec.js`, `tests/integration/modular.spec.js`), performance probe (`tests/performance/load.spec.js`), and Node unit tests (`tests/unit/*.test.js`). | Single-page experience with calculator, storage, weather awareness, and daylight warnings. |

## `index.html` – Wake Time Calculator
- **Module entry point:** `js/app/main.js`, orchestrating library helpers (`js/lib/`), awareness modules (`js/app/awareness.js`, `js/app/weather.js`, `js/app/dawn.js`, `js/app/location.js`), UI utilities, and idle scheduling helpers.
- **Current automation:**
  - Core planner journey (`tests/integration/modular.spec.js`).
  - Awareness + weather flows (`tests/integration/wake-flow.spec.js`).
  - Performance budget check (`tests/performance/load.spec.js`).
  - Calculator unit coverage (`tests/unit/*.test.js`).
- **Target coverage:**
  - Maintain calculator/storage unit tests to keep math and persistence deterministic.
  - Preserve both Playwright journeys so DOM interactions, awareness behaviors, and time-allocation bars stay validated.
  - Exercise weather/dawn success and failure paths, daylight badge updates, and storage persistence of awareness preferences.
  - Continue enforcing the load budget guardrail in the performance probe.

## Documentation Promises & Backlog
- **MIGRATION.md:** Commits to unit, integration, and cross-browser coverage for the modular architecture. Treat these expectations as the backlog to uphold rather than a description of a future state.
- **README.md:** Reinforces the modular testing matrix (unit + integration Playwright suites). Keep documentation honest by checking in test assets alongside any updates to these promises.

Use this document as the canonical reference when proposing new or restored test suites so reviewers know which flows each suite must exercise, and annotate future edits with the actual automation status at that time.
