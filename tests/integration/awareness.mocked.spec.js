import { test, expect } from '@playwright/test';
import {
  resetAwarenessEvents,
  setMockApiFailures,
  setMockGeolocation,
  setupAwarenessMocks,
  waitForAwarenessEvent,
  triggerAwareness,
} from '../helpers/awareness-mocks.js';

const FORT_COLLINS = {
  coords: { lat: 39.7392, lon: -104.9903 },
  reverse: {
    name: 'Fort Collins',
    admin1: 'Colorado',
    country: 'United States',
    country_code: 'US',
    latitude: 39.7392,
    longitude: -104.9903,
    timezone: 'America/Denver',
  },
};

test.describe('Weather awareness with mocked data', () => {
  test.beforeEach(async ({ page }) => {
    await setupAwarenessMocks(page);
    await resetAwarenessEvents(page);
  });

  test('surfaces slick icy caution when wetness heuristics trigger freeze-thaw @full', async ({
    page,
  }) => {
    await page.goto('/index.html');
    await triggerAwareness(page);

    // Give awareness more time to process in CI
    await page.waitForTimeout(500);

    await expect
      .poll(() =>
        page.evaluate(
          () => window.__latestWetnessInsight?.label ?? null
        ),
        {
          timeout: 15000,
          message: 'Expected wetness insight to be calculated'
        }
      )
      .toBe('Slick/Icy');
    await expect(page.locator('#awCity')).toHaveText(/Mocked Trailhead/);
    await expect(page.locator('#awMsg')).toBeHidden();
    await expect(page.locator('#awWetness')).toHaveAttribute('title', /0.22"/);
  });

  test('reports location denied when geolocation access fails @full', async ({
    page,
  }) => {
    await page.goto('/index.html');
    await triggerAwareness(page);

    // Give awareness more time to process in CI
    await page.waitForTimeout(500);

    await expect
      .poll(() =>
        page.evaluate(
          () => window.__latestWetnessInsight?.label ?? null
        ),
        {
          timeout: 15000,
          message: 'Expected wetness insight to be calculated'
        }
      )
      .toBe('Slick/Icy');

    await setMockGeolocation(page, { mode: 'denied' });
    await page.getByRole('button', { name: 'Use my location' }).click();

    const denied = await waitForAwarenessEvent(page, 'location-denied');
    expect(denied.detail.message).toContain('denied');

    await expect(page.locator('#awMsg')).toHaveText('Location denied.');
    await expect
      .poll(async () =>
        page.evaluate(() =>
          document.getElementById('awDecisionText')?.textContent?.trim()
        )
      )
      .toBe('—');
  });

  test('refreshes awareness when geolocation succeeds @full', async ({
    page,
  }) => {
    await page.goto('/index.html');
    await triggerAwareness(page);

    // Give awareness more time to process in CI
    await page.waitForTimeout(500);

    await expect
      .poll(() =>
        page.evaluate(
          () => window.__latestWetnessInsight?.label ?? null
        ),
        {
          timeout: 15000,
          message: 'Expected wetness insight to be calculated'
        }
      )
      .toBe('Slick/Icy');

    await setMockGeolocation(page, {
      mode: 'success',
      coords: FORT_COLLINS.coords,
      reverse: FORT_COLLINS.reverse,
    });

    await page.getByRole('button', { name: 'Use my location' }).click();

    await expect
      .poll(() =>
        page.evaluate(() => document.getElementById('awCity')?.textContent ?? '')
      )
      .toContain('Fort Collins');

    await expect
      .poll(() =>
        page.evaluate(
          () => window.__latestWetnessInsight?.label ?? null
        )
      )
      .toBe('Slick/Icy');

    await expect(page.locator('#awCity')).toHaveText(/Fort Collins, CO, US/);
    await expect(page.locator('#awMsg')).toBeHidden();
  });

  test('surfaces error messaging when weather requests fail @edge', async ({
    page,
  }) => {
    await page.goto('/index.html');
    await triggerAwareness(page);
    await waitForAwarenessEvent(page, 'ready');
    await expect
      .poll(() =>
        page.evaluate(
          () => window.__latestWetnessInsight?.label ?? null
        )
      )
      .toBe('Slick/Icy');

    await setMockGeolocation(page, {
      mode: 'success',
      coords: FORT_COLLINS.coords,
      reverse: FORT_COLLINS.reverse,
    });
    await setMockApiFailures(page, { forecast: true });

    await page.getByRole('button', { name: 'Use my location' }).click();

    const errorEvent = await waitForAwarenessEvent(
      page,
      'error',
      ({ message }) => message === 'Unable to load weather data'
    );

    expect(errorEvent.detail.message).toBe('Unable to load weather data');
    await expect(page.locator('#awMsg')).toHaveText(
      'Unable to load weather data'
    );
    await expect(page.locator('#awDecisionText')).toHaveText('—');

    await setMockApiFailures(page, { forecast: false });
  });
});
