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

});
