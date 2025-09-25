import { test, expect } from '@playwright/test';

// Allow generous headroom for cold CDN fetches on shared CI runners.
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
