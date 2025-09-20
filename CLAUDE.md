# Claude Code Instructions

## Project Context
This is a single-file wake time calculator app with weather awareness. The entire app is contained in `/Users/mikeedwards/dev-play/wake.html`.

## Development Guidelines

### Code Style
- **NO COMMENTS** unless explicitly requested
- Maintain existing code patterns and conventions
- Use existing utilities/libraries (don't add new dependencies)
- Preserve exact indentation when editing

### Testing Commands
None currently configured - app runs directly in browser.

### File Structure
```
/Users/mikeedwards/dev-play/
├── wake.html      # Main application (HTML + inline CSS/JS)
├── agent.md       # Technical documentation
└── CLAUDE.md      # This file
```

## Quick Commands

### Open in browser
```bash
open /Users/mikeedwards/dev-play/wake.html
```

### View full source
```bash
cat wake.html
```

## Common Edits

### Update run locations
Search for `<optgroup label="Dirt by distance">` or `<optgroup label="No dirt">` in wake.html

### Adjust wetness thresholds
Search for `categorizeWetness` function

### Modify cache duration
Search for `CACHE_DURATION` constant

## API Keys
No API keys required - all services used are free/public:
- SunriseSunset.io
- Open-Meteo
- Open-Meteo Geocoding

## Notes
- App uses localStorage for persistence
- 15-minute cache for API responses
- Responsive design with mobile breakpoints
- No build process - edit and refresh