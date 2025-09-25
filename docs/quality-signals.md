# Quality Signal Matrix

The table below summarizes the currently-wired npm scripts and the level of assurance they provide.

| Command | Invoked tooling | Quality signal provided |
| --- | --- | --- |
| `npm test` | `playwright test` | Cross-browser end-to-end coverage for legacy and modular entry points. |
| `npm run test:unit` | `node --test tests/unit` | Calculator math, storage helpers, and utility functions. |
| `npm run test:modular` | Playwright (`index-modular.html`) | Core modular UX (form inputs, storage sync, time bars). |
| `npm run test:full-modular` | Playwright (`index-full-modular.html`) | Weather/dawn awareness, error states, and orchestration flows. |
| `npm run test:performance` | Playwright navigation timing probe | Ensures DOMContentLoaded stays within the documented budget. |
| `npm run validate:all` | Prettier + html-validate + unit tests | Formatting, structural HTML, and logic smoke in one command. |
| `npm run serve` | `python3 -m http.server 8000` | Manual preview only (no automated assertions). |

> Tip: When touching shared modules, pair `npm run test:unit` with at least one Playwright suite to keep both logic and UI flows covered.
