# TODO

## CI/CD Cleanup (after Safari tests remain stable)

Once Safari tests have been consistently green for a few weeks, remove the temporary debug instrumentation:

1. **Remove debug error collection from awareness.js:376**
   - Remove `window.__awarenessDebugErrors` array
   - Remove MAX_DEBUG_ERRORS constant
   - Remove circular buffer logic

2. **Remove debug error collection from test helper (tests/helpers/awareness-mocks.js:294)**
   - Remove `debugErrors` from summary object
   - Remove console.log statements for test debugging

3. **Clean up test-only globals**
   - Remove `window.__triggerAwarenessForTests` from main.js
   - Remove `window.__latestWetnessInsight` references
   - Remove `window.__latestSchedule` if not needed

These were added to diagnose the "no matching hour" error in CI and shouldn't be part of the production code long-term.

## Future Performance Considerations

- Monitor if test suite grows beyond 15-20 tests - may need to consider test splitting or matrix builds
- If adding more browsers, consider running them in parallel jobs rather than sequential projects
- Keep an eye on Playwright cache size (currently 59MB) - if it grows significantly, may need cache optimization