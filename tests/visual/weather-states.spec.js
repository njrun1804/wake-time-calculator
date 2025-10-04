import { test, expect } from '@playwright/test';
import {
  setupAwarenessMocks,
  resetAwarenessEvents,
  triggerAwareness,
  awarenessStatePresets,
} from '../helpers/awareness-mocks.js';

/**
 * Visual regression tests for weather awareness states
 * Tests color-coded UI states: OK (green), Caution (yellow), Avoid (red)
 * @visual
 */

test.describe('Weather Awareness Visual States @visual', () => {
  // Tests that require unverified location state (no mocks)
  test.describe('Unverified location states', () => {
    test('initial state before location verification', async ({ page }) => {
      await page.goto('/index.html');
      await expect(page.locator('h1')).toBeVisible();

      // Wait for awareness module to initialize
      await page.waitForTimeout(500);

      // Should show "Verify location" badge
      await expect(page.locator('#awCity')).toHaveText(/Verify location/);

      // Screenshot of initial unverified state
      await expect(page).toHaveScreenshot('weather-initial-unverified.png', {
        animations: 'disabled',
      });
    });

    test('location badge states', async ({ page, context }) => {
      // Step 1: Unverified state
      await page.goto('/index.html');
      await page.waitForTimeout(500);

      const badge = page.locator('#awCity');
      await expect(badge).toHaveClass(/verification-needed/);
      await expect(badge).toHaveScreenshot('location-badge-unverified.png', {
        animations: 'disabled',
      });

      // Step 2: Create a fresh page with mocks for verified state
      const page2 = await context.newPage();
      await setupAwarenessMocks(page2);
      await page2.goto('/index.html');
      await triggerAwareness(page2);
      await page2.waitForTimeout(1000);

      // Verified state
      const badge2 = page2.locator('#awCity');
      await expect(badge2).toHaveScreenshot('location-badge-verified.png', {
        animations: 'disabled',
      });

      await page2.close();
    });
  });

  // Tests that use mocked data
  test.describe('With mocked weather data', () => {
    test.beforeEach(async ({ page }) => {
      await setupAwarenessMocks(page, {
        geolocation: {
          mode: 'success',
          coords: { latitude: 40.7306, longitude: -73.9866 },
        },
      });
      await resetAwarenessEvents(page);
    });

    test('loading state during weather fetch', async ({ page }) => {
      await setupAwarenessMocks(page, {
        geolocation: {
          mode: 'success',
          coords: { latitude: 40.7306, longitude: -73.9866 },
        },
        delays: {
          forecast: 600,
        },
      });
      await resetAwarenessEvents(page);
      await page.goto('/index.html');

      // Click to trigger loading
      await page.click('#useMyLocation');

      // Allow time for spinner to render before forecast resolves
      await page.waitForTimeout(350);

      await expect(page).toHaveScreenshot('weather-loading-state.png', {
        animations: 'disabled',
        maxDiffPixels: 100, // Allow some variation due to timing
      });
    });

  test('OK state - favorable conditions (green indicators)', async ({
    page,
  }) => {
    // Setup mocks with OK preset
    await setupAwarenessMocks(page, {
      fixtureOverrides: awarenessStatePresets.ok(),
    });
    await resetAwarenessEvents(page);
    await page.goto('/index.html');

    await triggerAwareness(page);
    await page.waitForTimeout(1000);

    // Verify OK state indicators
    const awarenessSection = page.locator('#awareness');
    await expect(awarenessSection).toBeVisible();

    // Verify wetness decision is OK
    await expect
      .poll(
        () =>
          page.evaluate(
            () => window.__latestWetnessInsight?.decision ?? null
          ),
        { timeout: 5000 }
      )
      .toBe('OK');

    // Screenshot of favorable conditions
    await expect(page).toHaveScreenshot('weather-ok-green.png', {
      animations: 'disabled',
    });
  });

  test('Caution state - marginal conditions (yellow indicators)', async ({
    page,
  }) => {
    // Setup mocks with Caution preset
    await setupAwarenessMocks(page, {
      fixtureOverrides: awarenessStatePresets.caution(),
    });
    await resetAwarenessEvents(page);
    await page.goto('/index.html');

    await triggerAwareness(page);
    await page.waitForTimeout(1000);

    // Verify Caution state
    await expect
      .poll(
        () =>
          page.evaluate(
            () => window.__latestWetnessInsight?.decision ?? null
          ),
        { timeout: 5000 }
      )
      .toBe('Caution');

    // Screenshot of caution state
    await expect(page).toHaveScreenshot('weather-caution-yellow.png', {
      animations: 'disabled',
    });
  });

  test('Avoid state - unfavorable conditions (red indicators)', async ({
    page,
  }) => {
    // Setup mocks with Avoid preset
    await setupAwarenessMocks(page, {
      fixtureOverrides: awarenessStatePresets.avoid(),
    });
    await resetAwarenessEvents(page);
    await page.goto('/index.html');

    await triggerAwareness(page);
    await page.waitForTimeout(1500);

    // Verify Avoid state
    await expect
      .poll(
        () =>
          page.evaluate(
            () => window.__latestWetnessInsight?.decision ?? null
          ),
        { timeout: 5000 }
      )
      .toBe('Avoid');

    // Screenshot of avoid state
    await expect(page).toHaveScreenshot('weather-avoid-red.png', {
      animations: 'disabled',
    });
  });

  test('dawn time warning icon visibility', async ({ page }) => {
    await page.goto('/index.html');
    await triggerAwareness(page);
    await page.waitForTimeout(1000);

    // Screenshot showing dawn time display
    await expect(page.locator('#awareness')).toHaveScreenshot(
      'weather-dawn-display.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('trail status labels and colors', async ({ page }) => {
    await page.goto('/index.html');
    await triggerAwareness(page);
    await page.waitForTimeout(1000);

    const wetnessElement = page.locator('#awWetness');
    await expect(wetnessElement).toBeVisible();

    // Screenshot of trail status section
    await expect(wetnessElement).toHaveScreenshot('trail-status-display.png', {
      animations: 'disabled',
    });
  });

  test('responsive weather grid layout', async ({ page }) => {
    // Test grid layout at mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');
    await triggerAwareness(page);
    await page.waitForTimeout(1000);

    // Screenshot of mobile weather grid
    await expect(page.locator('.aw-grid')).toHaveScreenshot(
      'weather-grid-mobile.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('error message display', async ({ page }) => {
    await page.goto('/index.html');

    // Mock API failure
    await page.route('**/api/**', (route) => route.abort());

    await page.click('#useMyLocation');
    await page.waitForTimeout(1000);

    // Screenshot showing error state
    await expect(page.locator('#awareness')).toHaveScreenshot(
      'weather-error-state.png',
      {
        animations: 'disabled',
        maxDiffPixels: 100,
      }
    );
  });
  }); // End "With mocked weather data" describe block
}); // End "Weather Awareness Visual States" describe block
