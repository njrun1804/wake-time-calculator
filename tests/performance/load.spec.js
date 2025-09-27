import { test, expect } from '@playwright/test';
import { mockCDNResources } from '../helpers/cdn-mock.js';

// Tighter budget when CDN resources are mocked in CI
const MAX_DOM_CONTENT_LOADED = process.env.CI ? 3000 : 8000;

test.describe('Performance budget @performance', () => {
  test('app loads within budget', async ({ page }) => {
    // Mock CDN resources in CI for consistent performance
    await mockCDNResources(page);

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
