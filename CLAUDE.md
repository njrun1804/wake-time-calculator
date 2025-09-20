# Claude Code Instructions

## Project Context
This is a single-file wake time calculator app with weather awareness. The app entry is `wake.html` at the repository root.

## Development Guidelines

### Code Style
- Keep edits concise and focused; avoid unrelated refactors
- Maintain existing patterns and conventions
- Prefer no inline comments unless clarifying tradeoffs
- Preserve indentation and formatting
- Allowed: Tailwind + DaisyUI via CDN (already used); avoid adding build steps

### Testing Commands
None currently configured - app runs directly in browser.

### File Structure
```
repo/
├── wake.html      # Main application (HTML + inline CSS/JS)
├── index.html     # Redirect to wake.html (for GitHub Pages)
├── README.md      # Project overview and usage
├── agent.md       # Technical documentation for agents
└── CLAUDE.md      # This file
```

## Quick Commands

### Open in browser
```bash
open wake.html
```

### View full source
```bash
sed -n '1,200p' wake.html
```

## Common Edits

### Update run locations
Search for `<optgroup label="Dirt by distance">` or `<optgroup label="No dirt">` in wake.html

### Adjust wetness thresholds
Search for `categorizeWetness` function

### Modify cache duration
Search for `CACHE_DURATION` constant

## APIs
No API keys required — public services:
- SunriseSunset.io (dawn)
- Open‑Meteo (hourly + daily weather, geocoding, WMO weathercode)

## Notes
- App uses localStorage for persistence
- 15-minute cache for API responses (localStorage + in‑memory)
- Responsive design with mobile breakpoints
- Tailwind + DaisyUI via CDN (no build process) — edit and refresh
