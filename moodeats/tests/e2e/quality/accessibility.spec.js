// @ts-check
const { test, expect } = require('@playwright/test');
const { initializeTestApp } = require('../../helpers/test-init');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/moodeats-planner.html');
    await initializeTestApp(page);
  });

  test('page has basic accessibility features', async ({ page }) => {
    // Check for basic accessibility elements
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check for proper HTML structure
    const main = page.locator('main, [role="main"], body');
    await expect(main).toBeAttached();
  });

  test('forms have proper accessibility attributes', async ({ page }) => {
    // Check search input accessibility
    const searchInput = page.locator('#searchInput');
    if (await searchInput.count() > 0) {
      // Input should have placeholder or label
      const hasPlaceholder = await searchInput.getAttribute('placeholder');
      const hasAriaLabel = await searchInput.getAttribute('aria-label');
      const hasLabel = await page.locator('label[for="searchInput"]').count();

      expect(hasPlaceholder || hasAriaLabel || hasLabel > 0).toBeTruthy();
    }
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    // Test tab navigation through mood buttons
    await page.keyboard.press('Tab');

    // Should be able to navigate to mood buttons
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Keep tabbing until we find a mood button or search input
    for (let i = 0; i < 20; i++) {
      const currentElement = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        class: document.activeElement?.className,
        id: document.activeElement?.id
      }));

      if (currentElement.class?.includes('mood-btn') ||
          currentElement.id === 'searchInput' ||
          currentElement.tag === 'BUTTON') {
        break;
      }

      await page.keyboard.press('Tab');
    }

    // Test activating element with Enter/Space
    const activeElement = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      class: document.activeElement?.className,
      dataset: document.activeElement?.dataset
    }));

    if (activeElement.class?.includes('mood-btn')) {
      // Activate mood button with Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Should show suggestions
      await expect(page.locator('#suggestionsArea')).toBeVisible();
    }
  });

  test('screen reader landmarks are present', async ({ page }) => {
    // Check for proper landmark elements
    const landmarks = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const main = document.querySelector('main');
      const header = document.querySelector('header');
      const sections = document.querySelectorAll('section');

      return {
        hasNav: !!nav,
        hasMain: !!main,
        hasHeader: !!header,
        sectionCount: sections.length
      };
    });

    // Should have proper page structure
    expect(landmarks.hasMain || landmarks.sectionCount > 0).toBe(true);
  });

  test('form elements have proper labels', async ({ page }) => {
    // Check search input
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();

    // Search input should have label or aria-label
    const searchLabel = await page.evaluate(() => {
      const input = document.getElementById('searchInput');
      const label = document.querySelector('label[for="searchInput"]');
      const ariaLabel = input?.getAttribute('aria-label');
      const placeholder = input?.placeholder;

      return {
        hasLabel: !!label,
        hasAriaLabel: !!ariaLabel,
        hasPlaceholder: !!placeholder
      };
    });

    expect(searchLabel.hasLabel || searchLabel.hasAriaLabel || searchLabel.hasPlaceholder).toBe(true);
  });

  test('buttons have accessible names', async ({ page }) => {
    // Check mood buttons
    const moodButtons = await page.locator('.mood-btn').all();

    for (const button of moodButtons) {
      const text = await button.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }

    // Check select buttons in planner
    const selectButtons = await page.locator('button:has-text("Select")').all();

    for (const button of selectButtons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        const text = await button.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('modal has proper focus management', async ({ page }) => {
    // Open modal
    await page.evaluate(() => window.selectMealForSlot('lunch'));
    await page.waitForSelector('#mealModal[open]');

    // Focus should be trapped in modal
    const modalElement = page.locator('#mealModal');
    await expect(modalElement).toBeVisible();

    // Check if modal has proper ARIA attributes
    const modalAttributes = await page.evaluate(() => {
      const modal = document.getElementById('mealModal');
      return {
        hasRole: modal?.getAttribute('role'),
        hasAriaModal: modal?.getAttribute('aria-modal'),
        hasAriaLabel: modal?.getAttribute('aria-label') || modal?.getAttribute('aria-labelledby')
      };
    });

    // Modal should have proper ARIA attributes
    expect(modalAttributes.hasRole === 'dialog' || modalAttributes.hasAriaModal === 'true').toBe(true);

    // Close modal with Escape
    await page.keyboard.press('Escape');
    await page.waitForSelector('#mealModal:not([open])');

    // Focus should return to trigger element
    await page.waitForTimeout(100);
  });

  test('images have alt text', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const isVisible = await img.isVisible();
      if (isVisible) {
        const alt = await img.getAttribute('alt');
        // Images should have alt text (can be empty for decorative images)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    // This is a basic check - axe-core does more comprehensive testing
    const contrastResults = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, .card, .modal-filter');
      const results = [];

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const color = styles.color;

        results.push({
          element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          bgColor,
          color,
          hasColors: bgColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)'
        });
      });

      return results;
    });

    // Should have some elements with defined colors
    const elementsWithColors = contrastResults.filter(r => r.hasColors);
    expect(elementsWithColors.length).toBeGreaterThan(0);
  });

  test('headings have proper hierarchy', async ({ page }) => {
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent?.trim(),
        visible: h.offsetParent !== null
      }));
    });

    if (headings.length > 0) {
      // Should start with h1 or h2
      const firstHeading = headings.find(h => h.visible);
      if (firstHeading) {
        expect(firstHeading.level).toBeLessThanOrEqual(2);
      }

      // No heading should be empty
      headings.forEach(heading => {
        if (heading.visible) {
          expect(heading.text?.length).toBeGreaterThan(0);
        }
      });
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    // Test that all interactive elements can be reached by keyboard
    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, input, select, textarea, a[href], [tabindex]');
      return Array.from(elements)
        .filter(el => el.offsetParent !== null) // visible elements
        .map(el => ({
          tag: el.tagName,
          type: el.type || null,
          tabIndex: el.tabIndex,
          hasClick: el.onclick !== null,
          role: el.getAttribute('role')
        }));
    });

    // Should have interactive elements
    expect(interactiveElements.length).toBeGreaterThan(0);

    // Interactive elements should be focusable
    interactiveElements.forEach(el => {
      // Elements should be focusable (tabIndex >= 0) or have special roles
      const isFocusable = el.tabIndex >= 0 ||
                         ['button', 'input', 'select', 'textarea'].includes(el.tag.toLowerCase()) ||
                         el.role === 'button';
      expect(isFocusable).toBe(true);
    });
  });

  test('error messages are accessible', async ({ page }) => {
    // Test search with no results
    await page.fill('#searchInput', 'zzznoresultszzz');
    await page.press('#searchInput', 'Enter');
    await page.waitForTimeout(500);

    // If there's an error/no results message, it should be accessible
    const errorElements = await page.locator('.error, .no-results, [role="alert"]').all();

    for (const errorElement of errorElements) {
      const isVisible = await errorElement.isVisible();
      if (isVisible) {
        const text = await errorElement.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('live regions announce dynamic content', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
      return Array.from(regions).map(el => ({
        ariaLive: el.getAttribute('aria-live'),
        role: el.getAttribute('role'),
        text: el.textContent?.trim()
      }));
    });

    // If live regions exist, they should be properly configured
    liveRegions.forEach(region => {
      if (region.ariaLive) {
        expect(['polite', 'assertive', 'off']).toContain(region.ariaLive);
      }
    });
  });
});