# Page-to-Test Coverage Expectations

This guide maps each HTML entry point to the JavaScript modules it loads and the minimum test coverage required for confidence when rebuilding the suites.

## `wake.html` – Legacy Monolith
- **Primary script:** Inline `<script>` block containing calculator, storage, weather awareness, and UI updates in a single IIFE.
- **Coverage tier:** Smoke-level regression only. Exercise the end-to-end happy path to ensure the legacy bundle still calculates wake times, persists form state, and renders weather awareness without JavaScript errors.
- **Why limited:** Migration notes direct full test ownership to the modular architecture. Prioritize sanity checks that confirm backwards compatibility while deeper suites target modular builds.

## `index-modular.html` – Core Modular Experience
- **Module entry point:** `js/main.js`, which wires calculator logic, storage helpers, constants, and modular UI bindings (form inputs, outputs, and time-allocation bars).
- **Coverage tier:**
  - Unit tests for calculator math, time breakdown helpers, and storage persistence functions.
  - Integration/E2E suite that walks the DOM interactions: input changes, recalculation of wake time outputs, and rendering of time-allocation bars.
- **Notes:** This page omits weather awareness modules, so coverage can skip async weather/dawn fetch scenarios.

## `index-full-modular.html` – Complete Modular Stack
- **Module entry point:** `js/main-full.js`, orchestrating calculator/storage modules plus awareness modules (`js/modules/awareness/`), weather/dawn fetchers, and idle scheduling utilities.
- **Coverage tier:**
  - All tests listed for `index-modular.html` (core calculator + integration flows).
  - Additional integration/E2E scenarios covering:
    - Weather fetch success and failure paths (including cached responses).
    - Dawn-based badge updates and headlamp/daylight toggles.
    - Error messaging and retry affordances when APIs fail.
    - Storage persistence of awareness preferences and inputs.
- **Notes:** Ensure asynchronous behaviors are asserted with deterministic mocks to keep suites reliable.

## Documentation Promises
- **MIGRATION.md:** Commits to unit, integration, and cross-browser coverage for the modular architecture; treat these expectations as non-negotiable for `index-modular.html` and `index-full-modular.html`.
- **README.md:** Reinforces the modular testing matrix (unit + integration Playwright suites). Align remediation priorities with these promises before extending legacy coverage.

Use this document as the canonical reference when proposing new or restored test suites so reviewers know which pages each suite must exercise.
