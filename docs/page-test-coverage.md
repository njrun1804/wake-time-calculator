# Page-to-Test Coverage Expectations

This guide maps each HTML entry point to the JavaScript modules it loads and documents both the **current automation status** and the **target coverage** we intend to rebuild.

## `wake.html` – Legacy Monolith
- **Primary script:** Inline `<script>` block containing calculator, storage, weather awareness, and UI updates in a single IIFE.
- **Current automation:** None. Manual smoke checks only when touching this file.
- **Target coverage:** A single happy-path smoke Playwright journey that verifies wake-time math, localStorage persistence, and weather banner rendering without JavaScript errors.
- **Why limited:** Migration notes direct full test ownership to the modular architecture. Prioritize sanity checks that confirm backwards compatibility while deeper suites target modular builds.

## `index-modular.html` – Core Modular Experience
- **Module entry point:** `js/main.js`, which wires calculator logic, storage helpers, constants, and modular UI bindings (form inputs, outputs, and time-allocation bars).
- **Current automation:** Not yet restored; manual testing required.
- **Target coverage:**
  - Unit tests for calculator math, time breakdown helpers, and storage persistence functions.
  - Playwright integration journey that walks the DOM interactions: input changes, recalculation of wake time outputs, and rendering of time-allocation bars.
- **Notes:** This page omits weather awareness modules, so coverage can skip async weather/dawn fetch scenarios until the full stack page below is rebuilt.

## `index-full-modular.html` – Complete Modular Stack
- **Module entry point:** `js/main-full.js`, orchestrating calculator/storage modules plus awareness modules (`js/modules/awareness/`), weather/dawn fetchers, and idle scheduling utilities.
- **Current automation:** Not yet restored; browser-based coverage pending.
- **Target coverage:**
  - All tests listed for `index-modular.html` (core calculator + integration flows).
  - Additional integration/E2E scenarios covering:
    - Weather fetch success and failure paths (including cached responses).
    - Dawn-based badge updates and headlamp/daylight toggles.
    - Error messaging and retry affordances when APIs fail.
    - Storage persistence of awareness preferences and inputs.
- **Notes:** Ensure asynchronous behaviors are asserted with deterministic mocks to keep suites reliable once the awareness suite returns.

## Documentation Promises & Backlog
- **MIGRATION.md:** Commits to unit, integration, and cross-browser coverage for the modular architecture. Treat these expectations as the backlog to restore rather than a description of the current repository state.
- **README.md:** Reinforces the modular testing matrix (unit + integration Playwright suites). Keep documentation honest by checking in test assets alongside any updates to these promises.

Use this document as the canonical reference when proposing new or restored test suites so reviewers know which pages each suite must exercise, and annotate future edits with the actual automation status at that time.
