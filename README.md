# Wake Time Calculator

A single-file web app that helps you calculate wake/run times with weather awareness.

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

## Notes

- The app uses public APIs for sunrise and weather; be mindful of rate limits.
- `wake.min.html` is produced by minifying `wake.html` and can be used for production deployment.
