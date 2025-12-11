# Wake Time Calculator (Agent README)

Weather-aware wake time calculator for runners. TypeScript + ES modules compiled to `dist/` (no bundler).

## Code map
- `src/index.html` – UI shell
- `src/css/main.css` – styles
- `src/app/main.ts` – app orchestrator (state, events, persistence)
- `src/app/awareness.ts` – weather/dawn awareness UI
- `src/app/weather.ts` – Open-Meteo integration + wetness scoring (NJ coastal calibration)
- `src/app/location.ts` – geolocation + geocoding
- `src/app/dawn.ts` – dawn times (SunriseSunset.io)
- `src/app/ui.ts` – UI helpers
- `src/lib/calculator.ts` – wake-time math
- `src/lib/{constants.ts,time.ts,schedulers.ts,storage.ts}` – shared utilities

### Module structure
- **Imports use `.js` extension**: TypeScript compiles to ES modules, imports must use `.js` extension
- **Type exports**: All types used across modules are exported (e.g., `WeatherData`, `WetnessData`, `DawnInfo`)
- **Section markers**: Modules use `// ============================================================================` comments to organize code sections
- **API types**: Response interfaces defined near their usage (e.g., `OpenMeteoHourlyResponse` in `weather.ts`)

## Run / test
```bash
nvm use
npm install              # installs typescript + tsx runner
npm run build            # compile TS/JS → dist/
npm run serve            # http://localhost:8000/ served from dist/
npm test                 # TS test runner (tsx --test)
npm run typecheck        # tsc --noEmit
npm run format           # Prettier (TS + JS + HTML)
```

## Testing

All modules have comprehensive unit test coverage (208 tests total):
- `tests/unit/lib/` – library module tests (calculator, time, storage, constants, schedulers)
- `tests/unit/app/` – application module tests (main, weather, location, dawn, awareness, ui)
- `tests/helpers/` – test utilities (mocks, fixtures)

Run tests with `npm test`.

## Data + config
- External APIs: Open-Meteo (weather + geocode), SunriseSunset.io (dawn); no API keys.
- **API validation**: All API responses are validated at runtime with type guards before use.
- Persistence: localStorage only; state saved on each change.
- Caching: weather 15min (CACHE_DURATION), geolocation 1m, dawn LRU (50 entries).
- Wetness calibration lives in `src/app/weather.ts` (clay-rich NJ soil, 7:1 snow ratio).
- Node version pinned via `.nvmrc`.

## Deployment / automation
- GitHub Pages deploy: `.github/workflows/pages.yml` runs `npm ci`, `npm run build`, publishes `dist/` on pushes to `main`.
- Source is compiled from `src/` to `dist/`; avoid adding runtime deps or bundlers.

## TypeScript patterns

### Error handling
- **Always use type guards in catch blocks**: Import `isError` and `getErrorMessage` from `lib/constants.ts`
  ```typescript
  import { isError, getErrorMessage } from "../lib/constants.js";
  
  try {
    // ...
  } catch (error) {
    if (isError(error) && error.name === "AbortError") {
      // Handle specific error type
    }
    const message = getErrorMessage(error, "Fallback message");
  }
  ```
- **Never use `as Error` assertions**: Use `isError()` type guard instead
- **Extract messages safely**: Use `getErrorMessage()` for user-facing error messages

### API response validation
- **All external API calls must validate responses**:
  1. Define TypeScript interfaces for API response structures
  2. Create validation functions (type guards) that check response structure
  3. Validate before using type assertions
  4. Throw descriptive errors if validation fails

  Example pattern:
  ```typescript
  interface ApiResponse { /* ... */ }
  
  const validateApiResponse = (data: unknown): data is ApiResponse => {
    if (!data || typeof data !== "object") return false;
    // Check required properties...
    return true;
  };
  
  const rawData = await res.json();
  if (!validateApiResponse(rawData)) {
    throw new Error("Invalid API response format");
  }
  const data = rawData; // Now safely typed
  ```

### Type organization
- **Export types used across modules**: Use `export interface` or `export type`
- **Use `import type` for type-only imports**: Reduces bundle size
- **Define API response types near their usage**: Keep interfaces close to the code that uses them
- **Window globals**: Declare in `declare global { interface Window { ... } }` blocks

### Type safety rules
- **No `any` types**: Use `unknown` and type guards instead
- **No `@ts-nocheck` or `@ts-ignore`**: Fix type issues properly
- **Type assertions only with validation**: Never assert without runtime checks
- **setTimeout return types**: Use `as unknown as number` (documented with comments explaining why)

## Agent guardrails
- Keep vanilla JS + ES modules; no frameworks/bundlers.
- Prefer consolidated modules with `// === SECTION ===` markers.
- **Comprehensive test coverage**: All modules have unit tests; maintain coverage when adding features.
- **TypeScript strict mode**: All code must pass `npm run typecheck` with no errors.
- **Error handling**: Always use `isError()` type guard, never `as Error` assertions.
- **API validation**: All external API responses must be validated before use.
