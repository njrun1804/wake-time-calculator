# Page-to-Test Coverage Expectations

This guide maps each HTML entry point to the scripts it loads and the automated checks that protect it. Use it when deciding which suites to run before sending a pull request.

## HTML entry points

| Page | Purpose | Primary scripts | Automated coverage |
| --- | --- | --- | --- |
| `index.html` | Redirect shell served at the project root for GitHub Pages. | N/A – performs a meta refresh to `index-modular.html`. | Exercised by the lightweight redirect checks that ship with the Playwright integration suite. |
| `index-modular.html` | Core modular calculator without the weather awareness experience. | `js/main.js` plus supporting modules from `js/core/` and `js/utils/`. | Covered by the Playwright modular-page specs and the calculator-focused unit tests. |
| `index-full-modular.html` | Feature-complete modular experience with weather, daylight, and awareness UI. | `js/main-full.js` orchestrates feature modules, including weather/dawn/location helpers and the awareness panel wiring in `js/modules/awareness.js`. | Protected by the full-modular Playwright specs, performance checks, and the shared unit suites for `js/core/` and `js/utils/`. |
| `wake.html` | Legacy single-file implementation retained for regression coverage. | Inline script at the end of the file. | Exercised by the legacy Playwright suite until the page can be retired. |

> **Tip:** When editing a page, run the suites listed above along with `npm run lint` for HTML/JS formatting and `npm run validate:html` for structural issues.

## Test suite overview

- **Unit tests (`npm run test:unit`)** – Exercise the pure logic in `js/core/` and `js/utils/`, ensuring calculator math and persistence logic stay intact.
- **Modular integration tests (`npm run test:modular`)** – Load the modular entry points in Playwright and confirm calculator inputs, outputs, and storage behavior.
- **Full modular tests (`npm run test:full-modular`)** – Cover awareness flows, dawn/weather lookups, and UI synchronization across the feature-complete experience.
- **Legacy tests (`npm run test:legacy`)** – Guard the monolithic `wake.html` behavior until it can be formally deprecated.
- **Performance tests (`npm run test:performance`)** – Track load metrics and ensure new features do not regress the time-to-interaction budget.

Always align your local runs with the entry point or module you touched. If a change affects shared logic, run both modular suites to ensure coverage for the core and full experiences.
