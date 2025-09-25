# Repository Guidelines

## Project Structure & Module Organization
Source lives under `js/`: domain logic in `js/core/`, feature modules in `js/modules/`, and shared helpers in `js/utils/`. Entry bundles `js/main.js` and `js/main-full.js` wire modules into the modular HTML shells (`index-modular.html`, `index-full-modular.html`). Styling sits in `css/`, while `docs/` contains mapping notes for the UI. Tests reside in `tests/` with `unit`, `integration`, `performance`, and `debug` folders; add new specs beside the scope they exercise. Treat `wake.html` as a legacy page—touch it only when backward compatibility is required.

## Build, Test, and Development Commands
Run `npm install` once per clone. Use `npm run serve` to launch a static preview at http://localhost:8000. `npm run test` executes the full Playwright matrix; narrow runs with `npm run test:unit`, `npm run test:modular`, or `npm run test:performance` when iterating. `npm run lint` and `npm run lint:js` check formatting for HTML and JavaScript, and `npm run validate:html` guards structural HTML issues. Chain them with `npm run validate:all` before requesting review.

## Coding Style & Naming Conventions
Follow Prettier defaults (2-space indent, trailing semicolons) via `npm run format` or `npm run format:js`. Modules are ES modules; prefer named exports and camelCase for functions, PascalCase for classes like `WakeTimeApp`, and kebab-case for files (`awareness.js`). Keep UI wiring in `js/modules/ui.js` and avoid cross-module imports that violate the boundaries documented in `agent.md`.

## Testing Guidelines
Playwright (`@playwright/test`) drives end-to-end and integration coverage; use descriptive `test.describe` blocks mirroring the feature hierarchy. Unit specs use Node's built-in test runner; co-locate fixtures under `tests/unit`. Name new files with `.test.js` and keep scenario descriptions imperative (e.g., `should calculate travel buffer`). Attach screenshots or traces with `npx playwright show-report` when diagnosing flaky runs.

## Commit & Pull Request Guidelines
History favors concise, imperative commits with optional context tags (e.g., `Optimize dawn calculation (#13)`). Reference issue numbers or PR IDs at the end. For pull requests, include: (1) a problem statement and the user-facing result, (2) a checklist of commands you ran, and (3) screenshots or Playwright trace links for UI-visible changes. Tag reviewers responsible for affected modules and highlight any follow-up tasks in the description.

## Agent Workflow Extras
Before ending a session, restate the exact lint and test commands executed. Prefer improving the modular HTML variants; note any legacy dependencies you touched. If a change alters load performance, capture metrics with `npm run test:performance` and summarize the deltas in your handoff.
