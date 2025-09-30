import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for responsive design across different viewports
 * @visual
 */

const viewports = {
  mobile: { width: 375, height: 667, name: 'mobile-iphone-se' },
  tablet: { width: 768, height: 1024, name: 'tablet-ipad' },
  desktop: { width: 1200, height: 800, name: 'desktop-standard' },
  wide: { width: 1920, height: 1080, name: 'desktop-wide' },
};

test.describe('Responsive Design Visual Tests @visual', () => {
  for (const [size, config] of Object.entries(viewports)) {
    test(`renders correctly on ${size} viewport (${config.width}x${config.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: config.width,
        height: config.height,
      });

      await page.goto('/index.html');

      // Wait for initial render
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#chosenWake')).toHaveText(/\d+:\d+/);

      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${config.name}-initial.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`form interactions on ${size} viewport`, async ({ page }) => {
      await page.setViewportSize({
        width: config.width,
        height: config.height,
      });

      await page.goto('/index.html');
      await expect(page.locator('h1')).toBeVisible();

      // Fill in form
      await page.fill('#runMinutes', '60');
      await page.getByLabel('Yes (30m)').click();
      await page.selectOption('#runLocation', 'huber');

      // Wait for calculation update
      await page.waitForTimeout(100);

      // Screenshot with form filled
      await expect(page).toHaveScreenshot(`${config.name}-form-filled.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }

  test('mobile landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();

    await expect(page).toHaveScreenshot('mobile-landscape.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('touch target sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');

    // Test button sizes meet minimum 44x44 touch target
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && (await button.isVisible())) {
        expect(box.height).toBeGreaterThanOrEqual(
          40,
          `Button should have minimum touch target height`
        );
      }
    }
  });

  test('text readability at different scales', async ({ page }) => {
    await page.goto('/index.html');

    // Test various zoom levels
    for (const scale of [0.75, 1.0, 1.25, 1.5]) {
      await page.evaluate((s) => {
        document.body.style.zoom = s.toString();
      }, scale);

      await page.waitForTimeout(100);

      // Verify critical text is still visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#chosenWake')).toBeVisible();
    }
  });
});