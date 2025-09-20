# Wake Time Calculator

Single‑file web app to plan wake/run times with location‑aware weather context, light trail conditions, and small UX helpers.

- Live: https://njrun1804.github.io/wake-time-calculator/
- App file: `wake.html` (HTML + CSS + JS in one file)

The UI uses Tailwind + DaisyUI via CDN and requires no build step.

## Quick start

- Install dependencies if you want the dev tools (Prettier, HTML validator) when running scripts via `npx` (not required):

```bash
# nothing to install globally — scripts use npx to auto-download tools
```

- Start a local static server (Node-based):

```bash
npm start
# opens at http://localhost:8000/wake.html
```

- Or use the Python server if you prefer:

```bash
npm run serve
# or
python3 -m http.server 8000
```

## Helpful scripts

- `npm run format` — formats `wake.html` with Prettier (uses `npx`).
- `npm run validate` — validates `wake.html` with `html-validate`.
- `npm run minify` — creates `wake.min.html` using `html-minifier-terser`.

## Editing in VS Code

Open this folder in VS Code and edit `wake.html` directly. If you installed the Claude CLI and want the editor integration, run `claude` from the integrated terminal to install the extension.

## Features

- Wake time calculator with fixed 45‑minute prep, plus run, travel (optional override), and breakfast inputs
- Awareness bar for tomorrow’s dawn and near‑dawn conditions:
  - Wind chill (or temp), precip probability, wet bulb, trail wetness score
  - City label from reverse geocoding; polite status messages
- Trail Wetness Score (inch‑units): decayed rain minus 60% of ET₀ (7‑day lookback), categorized and shown with the numeric value
- Red/black thresholding for quick scanning:
  - Wind chill ≤ 15°F, PoP ≥ 60%, Wet‑bulb ≥ 75°F, Wetness ≥ 0.40"
- “Clothes at dawn” suggestion from wind‑adjusted temp (+ “rain jacket” if PoP ≥ 60% and not snow)
- Headlamp badge next to Run location for “Dirt by distance” routes
- Optional hero background with glass card (CSS only)

## Configuration and theming

- Tailwind + DaisyUI are loaded via CDN (no build). You can theme via DaisyUI tokens.
- Hero background: set the CSS variable `--hero-img` in `wake.html` to an image path, e.g. `url('img/boston.jpg')`. If unset, a gradient is used.
- GitHub Pages includes `index.html` that redirects to `wake.html` (preserves query/hash).

## Notes

- Data sources (no API keys):
  - Dawn: SunriseSunset.io
  - Weather/Geocoding: Open‑Meteo
- Caching: 15‑minute in‑memory + localStorage cache for API payloads
- Geolocation only works on HTTPS or `localhost`
- `wake.min.html` is produced by minifying `wake.html` and can be used for production deployment

## Repository

This project is hosted at `https://github.com/njrun1804/wake-time-calculator`. Please open issues or PRs there. For local development, avoid committing `node_modules` — use the provided `.gitignore`.

## Local setup

For development on any machine:

```bash
git clone https://github.com/njrun1804/wake-time-calculator.git
cd wake-time-calculator
npm install    # installs dev tools and any runtime deps (do this locally)
npm start      # serves at http://localhost:8000/wake.html
```

Do not commit `node_modules/` to the repository; it's intentionally excluded by `.gitignore`.

## Deploying to GitHub Pages

Settings → Pages → “Deploy from a branch” → Branch: `main`, Folder: `/ (root)`.
The `index.html` redirect ensures the base URL works. Allow 1–3 minutes for deployments. Add a cache buster when verifying: `wake.html?v=<short_sha>`.
