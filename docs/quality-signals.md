# Quality Signal Matrix

The table below summarizes the currently-wired npm scripts and the level of assurance they provide.

| Command | Invoked tooling | Quality signal provided |
| --- | --- | --- |
| `npm run serve` | `python3 -m http.server 8000` | Serves static assets for manual verification only; no automated checks. |
| `npm test` | `npm run lint` | Delegates to the Prettier formatting check. |
| `npm run lint` | `prettier --check '*.html' 'js/**/*.js'` | Ensures HTML and JavaScript files conform to repository formatting rules. |
| `npm run format` | `prettier --write '*.html' 'js/**/*.js'` | Automatically applies formatting fixes (not a validation gate). |

At present, no unit, integration, Playwright, or HTML validation tooling remains installed. Reintroduce those dependencies before expecting the corresponding scripts to run.
