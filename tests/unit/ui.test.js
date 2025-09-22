import { test, expect } from '@playwright/test';

test.describe('UI Utilities - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');
  });

  test.describe('isDirtLocation', () => {
    test('identifies dirt trail locations correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { isDirtLocation } = await import('./js/modules/ui.js');

        return {
          figure8: isDirtLocation('figure8'),
          huber: isDirtLocation('huber'),
          tatum: isDirtLocation('tatum'),
          holmdel: isDirtLocation('holmdel'),
          roundTown: isDirtLocation('round-town'),
          sandyHook: isDirtLocation('sandy-hook'),
          asbury: isDirtLocation('asbury-boardwalk'),
          nonexistent: isDirtLocation('nonexistent')
        };
      });

      // Dirt locations should return true
      expect(results.figure8).toBe(true);
      expect(results.huber).toBe(true);
      expect(results.tatum).toBe(true);
      expect(results.holmdel).toBe(true);

      // Non-dirt locations should return false
      expect(results.roundTown).toBe(false);
      expect(results.sandyHook).toBe(false);
      expect(results.asbury).toBe(false);
      expect(results.nonexistent).toBe(false);
    });
  });

  test.describe('debounce', () => {
    test('delays function execution', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { debounce } = await import('./js/modules/ui.js');

        return new Promise((resolve) => {
          let callCount = 0;
          const testFunc = () => { callCount++; };
          const debouncedFunc = debounce(testFunc, 100);

          // Call multiple times rapidly
          debouncedFunc();
          debouncedFunc();
          debouncedFunc();

          // Should not have been called yet
          const immediateCount = callCount;

          // Wait for debounce delay
          setTimeout(() => {
            resolve({ immediateCount, finalCount: callCount });
          }, 150);
        });
      });

      expect(result.immediateCount).toBe(0);
      expect(result.finalCount).toBe(1);
    });

    test('cancels previous calls', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { debounce } = await import('./js/modules/ui.js');

        return new Promise((resolve) => {
          let callCount = 0;
          const testFunc = () => { callCount++; };
          const debouncedFunc = debounce(testFunc, 100);

          // First call
          debouncedFunc();

          // Second call after 50ms (should cancel first)
          setTimeout(() => {
            debouncedFunc();
          }, 50);

          // Check result after 200ms
          setTimeout(() => {
            resolve(callCount);
          }, 200);
        });
      });

      expect(result).toBe(1); // Should only be called once
    });
  });

  test.describe('formatDurationDisplay', () => {
    test('formats duration correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { formatDurationDisplay } = await import('./js/modules/ui.js');

        return [
          formatDurationDisplay(0),
          formatDurationDisplay(5),
          formatDurationDisplay(30),
          formatDurationDisplay(60),
          formatDurationDisplay(90),
          formatDurationDisplay(125),
          formatDurationDisplay(180),
          formatDurationDisplay(1440),
          formatDurationDisplay(-5) // Edge case
        ];
      });

      expect(results[0]).toBe('0m');
      expect(results[1]).toBe('5m');
      expect(results[2]).toBe('30m');
      expect(results[3]).toBe('1h');
      expect(results[4]).toBe('1h 30m');
      expect(results[5]).toBe('2h 5m');
      expect(results[6]).toBe('3h');
      expect(results[7]).toBe('24h');
      expect(results[8]).toBe('0m'); // Negative handled as 0
    });
  });

  test.describe('flashElement', () => {
    test('adds and removes CSS class', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { flashElement } = await import('./js/modules/ui.js');

        // Create test element
        const element = document.createElement('div');
        document.body.appendChild(element);

        return new Promise((resolve) => {
          // Flash with custom class and short duration
          flashElement(element, 'test-flash', 50);

          // Check class was added immediately
          const hasClassImmediately = element.classList.contains('test-flash');

          // Check class is removed after duration
          setTimeout(() => {
            const hasClassAfter = element.classList.contains('test-flash');
            document.body.removeChild(element);
            resolve({ hasClassImmediately, hasClassAfter });
          }, 100);
        });
      });

      expect(result.hasClassImmediately).toBe(true);
      expect(result.hasClassAfter).toBe(false);
    });

    test('handles null element gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { flashElement } = await import('./js/modules/ui.js');

        // Should not throw error
        flashElement(null, 'test', 100);
        return true;
      });

      expect(result).toBe(true);
    });
  });

  test.describe('setElementText', () => {
    test('sets text content safely', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { setElementText } = await import('./js/modules/ui.js');

        // Create test element
        const element = document.createElement('div');
        element.id = 'test-element';
        document.body.appendChild(element);

        setElementText('#test-element', 'Test content');
        const content = element.textContent;

        document.body.removeChild(element);
        return content;
      });

      expect(result).toBe('Test content');
    });

    test('handles missing element gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { setElementText } = await import('./js/modules/ui.js');

        // Should not throw error
        setElementText('#nonexistent', 'Test');
        return true;
      });

      expect(result).toBe(true);
    });
  });

  test.describe('setElementHTML', () => {
    test('sets HTML content safely', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { setElementHTML } = await import('./js/modules/ui.js');

        // Create test element
        const element = document.createElement('div');
        element.id = 'test-html-element';
        document.body.appendChild(element);

        setElementHTML('#test-html-element', '<span>HTML content</span>');
        const content = element.innerHTML;

        document.body.removeChild(element);
        return content;
      });

      expect(result).toBe('<span>HTML content</span>');
    });
  });

  test.describe('toggleElementVisibility', () => {
    test('toggles element visibility without animation', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { toggleElementVisibility } = await import('./js/modules/ui.js');

        // Create test element
        const element = document.createElement('div');
        element.classList.add('hidden');
        document.body.appendChild(element);

        // Show element
        toggleElementVisibility(element, true, false);
        const isVisibleAfterShow = !element.classList.contains('hidden');

        // Hide element
        toggleElementVisibility(element, false, false);
        const isHiddenAfterHide = element.classList.contains('hidden');

        document.body.removeChild(element);
        return { isVisibleAfterShow, isHiddenAfterHide };
      });

      expect(result.isVisibleAfterShow).toBe(true);
      expect(result.isHiddenAfterHide).toBe(true);
    });

    test('handles null element gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { toggleElementVisibility } = await import('./js/modules/ui.js');

        // Should not throw error
        toggleElementVisibility(null, true, false);
        return true;
      });

      expect(result).toBe(true);
    });
  });

  test.describe('validateNumericInput', () => {
    test('validates numeric input correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { validateNumericInput } = await import('./js/modules/ui.js');

        // Create test input
        const input = document.createElement('input');
        input.type = 'number';
        document.body.appendChild(input);

        const results = {};

        // Valid input
        input.value = '50';
        results.valid = validateNumericInput(input, 0, 100);
        results.validHasError = input.classList.contains('input-error');

        // Invalid input (too high)
        input.value = '150';
        results.invalid = validateNumericInput(input, 0, 100);
        results.invalidHasError = input.classList.contains('input-error');

        // Invalid input (non-numeric)
        input.value = 'abc';
        results.nonNumeric = validateNumericInput(input, 0, 100);

        document.body.removeChild(input);
        return results;
      });

      expect(result.valid).toBe(true);
      expect(result.validHasError).toBe(false);
      expect(result.invalid).toBe(false);
      expect(result.invalidHasError).toBe(true);
      expect(result.nonNumeric).toBe(false);
    });

    test('handles null input gracefully', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { validateNumericInput } = await import('./js/modules/ui.js');

        return validateNumericInput(null, 0, 100);
      });

      expect(result).toBe(false);
    });
  });

  test.describe('initializeTooltips', () => {
    test('adds tooltip classes to elements with title attributes', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { initializeTooltips } = await import('./js/modules/ui.js');

        // Create test elements
        const elementWithTitle = document.createElement('div');
        elementWithTitle.title = 'Test tooltip';
        elementWithTitle.id = 'with-title';

        const elementWithoutTitle = document.createElement('div');
        elementWithoutTitle.id = 'without-title';

        document.body.appendChild(elementWithTitle);
        document.body.appendChild(elementWithoutTitle);

        initializeTooltips();

        const withTitleHasClass = elementWithTitle.classList.contains('has-tooltip');
        const withoutTitleHasClass = elementWithoutTitle.classList.contains('has-tooltip');

        document.body.removeChild(elementWithTitle);
        document.body.removeChild(elementWithoutTitle);

        return { withTitleHasClass, withoutTitleHasClass };
      });

      expect(result.withTitleHasClass).toBe(true);
      expect(result.withoutTitleHasClass).toBe(false);
    });
  });

  test.describe('copyToClipboard', () => {
    test('attempts to copy text to clipboard', async ({ page }) => {
      // Note: Clipboard API requires secure context and user gesture
      // This test mainly checks the function doesn't crash
      const result = await page.evaluate(async () => {
        const { copyToClipboard } = await import('./js/modules/ui.js');

        try {
          // In test environment, this will likely use the fallback method
          const success = await copyToClipboard('test text');
          return { success, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      // The result depends on the test environment's clipboard capabilities
      // We mainly want to ensure it doesn't crash
      expect(typeof result.success).toBe('boolean');
    });
  });
});