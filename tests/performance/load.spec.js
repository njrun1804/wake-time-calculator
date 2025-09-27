import { test, expect } from '@playwright/test';

// Allow generous headroom for CDN fetches on shared CI runners
const MAX_DOM_CONTENT_LOADED = 8000;

test.describe('Performance budget @performance', () => {
  test('app loads within budget', async ({ page }) => {
    await page.goto('/index.html');

    const domContentLoaded = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType('navigation');
      return entry ? entry.domContentLoadedEventEnd : 0;
    });

    expect(domContentLoaded).toBeLessThanOrEqual(MAX_DOM_CONTENT_LOADED);

    // Additional performance metrics for debugging
    if (process.env.CI) {
      const metrics = await page.evaluate(() => {
        const [nav] = performance.getEntriesByType('navigation');
        return {
          domContentLoaded: nav?.domContentLoadedEventEnd || 0,
          loadComplete: nav?.loadEventEnd || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        };
      });
      console.log('Performance metrics:', metrics);
    }
  });
});
