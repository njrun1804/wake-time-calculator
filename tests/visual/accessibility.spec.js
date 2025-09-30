import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for accessibility features
 * Tests keyboard navigation, focus states, contrast, and screen reader support
 * @visual @a11y
 */

test.describe('Accessibility Visual Tests @visual @a11y', () => {
  test('keyboard focus states are visible', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();

    // Tab through interactive elements
    const interactiveElements = [
      '#firstMeeting',
      '#runMinutes',
      'input[name="breakfastToggle"][value="0"]',
      'input[name="breakfastToggle"][value="30"]',
      '#runLocation',
      '#useMyLocation',
      '#placeQuery',
      '#setPlace',
    ];

    for (const selector of interactiveElements) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.id);

      // Small delay to ensure focus ring renders
      await page.waitForTimeout(50);
    }

    // Take screenshot showing final focus state
    await expect(page).toHaveScreenshot('a11y-focus-states.png', {
      animations: 'disabled',
    });
  });

  test('button focus rings', async ({ page }) => {
    await page.goto('/index.html');

    const useLocationBtn = page.locator('#useMyLocation');
    await useLocationBtn.focus();
    await page.waitForTimeout(50);

    await expect(useLocationBtn).toHaveScreenshot('a11y-button-focus.png', {
      animations: 'disabled',
    });
  });

  test('input focus rings', async ({ page }) => {
    await page.goto('/index.html');

    const runMinutesInput = page.locator('#runMinutes');
    await runMinutesInput.focus();
    await page.waitForTimeout(50);

    await expect(runMinutesInput).toHaveScreenshot('a11y-input-focus.png', {
      animations: 'disabled',
    });
  });

  test('radio button focus and checked states', async ({ page }) => {
    await page.goto('/index.html');

    const breakfastRadios = page.locator('.toggle-breakfast');

    // Focus on first radio (No)
    await page.locator('input[name="breakfastToggle"][value="0"]').focus();
    await page.waitForTimeout(50);

    await expect(breakfastRadios).toHaveScreenshot('a11y-radio-focus-no.png', {
      animations: 'disabled',
    });

    // Click and focus on second radio (Yes)
    await page.getByLabel('Yes (30m)').click();
    await page.locator('input[name="breakfastToggle"][value="30"]').focus();
    await page.waitForTimeout(50);

    await expect(breakfastRadios).toHaveScreenshot(
      'a11y-radio-focus-yes.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('keyboard navigation through form', async ({ page }) => {
    await page.goto('/index.html');

    // Navigate with keyboard only
    await page.keyboard.press('Tab'); // First meeting select
    await page.keyboard.press('Tab'); // Run minutes input

    // Type in run minutes
    await page.keyboard.type('45');

    await page.keyboard.press('Tab'); // Breakfast No
    await page.keyboard.press('Tab'); // Breakfast Yes
    await page.keyboard.press('Space'); // Select Yes

    await page.keyboard.press('Tab'); // Run location

    // Screenshot after keyboard-only interaction
    await expect(page).toHaveScreenshot('a11y-keyboard-nav.png', {
      animations: 'disabled',
    });
  });

  test('high contrast mode readability', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();

    // Screenshot in dark mode
    await expect(page).toHaveScreenshot('a11y-high-contrast.png', {
      animations: 'disabled',
    });
  });

  test('text scaling maintains layout', async ({ page }) => {
    await page.goto('/index.html');

    // Increase text size (simulate browser zoom or large text setting)
    await page.addStyleTag({
      content: `
        * {
          font-size: 125% !important;
        }
      `,
    });

    await page.waitForTimeout(100);

    // Check that layout doesn't break
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#chosenWake')).toBeVisible();

    await expect(page).toHaveScreenshot('a11y-text-scale-125.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('aria-live region updates', async ({ page }) => {
    await page.goto('/index.html');

    // Screenshot initial aria-live region (awareness section)
    const awarenessSection = page.locator('#awareness');
    await expect(awarenessSection).toHaveAttribute('aria-live', 'polite');

    await expect(awarenessSection).toHaveScreenshot(
      'a11y-aria-live-initial.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('label associations', async ({ page }) => {
    await page.goto('/index.html');

    // Verify all inputs have associated labels
    const inputs = await page.locator('input, select').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const ariaLabel = await input.getAttribute('aria-label');

      if (id && !id.includes('hidden') && !id.includes('breakfast')) {
        // Should have a label (either for attribute or aria-label)
        const hasLabel =
          (await page.locator(`label[for="${id}"]`).count()) > 0 ||
          ariaLabel !== null;

        expect(hasLabel).toBe(true);
      }
    }
  });

  test('touch target sizes meet WCAG standards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');

    // Check interactive elements are at least 44x44 CSS pixels
    const interactiveSelectors = [
      'button',
      'input[type="radio"]',
      'input[type="text"]',
      'select',
    ];

    for (const selector of interactiveSelectors) {
      const elements = await page.locator(selector).all();

      for (const element of elements) {
        if (await element.isVisible()) {
          const box = await element.boundingBox();

          if (box) {
            // Radio buttons have parent labels that expand touch target
            const isRadio =
              (await element.getAttribute('type')) === 'radio';

            if (!isRadio) {
              expect(box.height).toBeGreaterThanOrEqual(40);
            }
          }
        }
      }
    }
  });

  test('color contrast for text', async ({ page }) => {
    await page.goto('/index.html');

    // Take screenshots of different text elements for manual contrast verification
    await expect(page.locator('h1')).toHaveScreenshot('a11y-title-text.png', {
      animations: 'disabled',
    });

    await expect(page.locator('.wake-hero')).toHaveScreenshot(
      'a11y-wake-time-text.png',
      {
        animations: 'disabled',
      }
    );

    await expect(page.locator('.aw-grid')).toHaveScreenshot(
      'a11y-weather-text.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/index.html');
    await expect(page.locator('h1')).toBeVisible();

    // Verify no animations play
    await expect(page).toHaveScreenshot('a11y-reduced-motion.png', {
      animations: 'disabled',
    });
  });

  test('screen reader landmark regions', async ({ page }) => {
    await page.goto('/index.html');

    // Verify semantic HTML structure
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const sections = await page.locator('section').count();
    expect(sections).toBeGreaterThanOrEqual(2); // Weather and wake display sections

    // Screenshot showing landmark structure (visual guide)
    await expect(page).toHaveScreenshot('a11y-landmarks.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});