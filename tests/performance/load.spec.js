import { test, expect } from '@playwright/test';

// Allow plenty of headroom for cold CDN fetches in CI runners.
const MAX_DOM_CONTENT_LOADED = 8000;

test.describe('Performance budget @performance', () => {
  test('modular entry loads within budget', async ({ page }) => {
    await page.goto('/index-modular.html');

    const domContentLoaded = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType('navigation');
      return entry ? entry.domContentLoadedEventEnd : 0;
    });

    expect(domContentLoaded).toBeLessThanOrEqual(MAX_DOM_CONTENT_LOADED);
  });
});
