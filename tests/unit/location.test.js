import { test, expect } from '@playwright/test';

test.describe('Location Module - Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');
  });

  test.describe('validateCoordinates', () => {
    test('validates coordinates correctly', async ({ page }) => {
      const results = await page.evaluate(async () => {
        const { validateCoordinates } = await import('./js/modules/location.js');

        return {
          // Valid coordinates
          validNormal: validateCoordinates(40.7128, -74.0060), // NYC
          validExtreme: validateCoordinates(90, 180), // Extreme valid
          validZero: validateCoordinates(0, 0), // Null Island

          // Invalid coordinates
          invalidLatHigh: validateCoordinates(91, 0), // Lat too high
          invalidLatLow: validateCoordinates(-91, 0), // Lat too low
          invalidLonHigh: validateCoordinates(0, 181), // Lon too high
          invalidLonLow: validateCoordinates(0, -181), // Lon too low
          invalidNaN: validateCoordinates(NaN, 0), // NaN latitude
          invalidInfinity: validateCoordinates(Infinity, 0), // Infinity latitude
          invalidString: validateCoordinates('40.7', '-74.0'), // String coordinates
          invalidNull: validateCoordinates(null, undefined) // Null/undefined
        };
      });

      // Valid coordinates should return true
      expect(results.validNormal).toBe(true);
      expect(results.validExtreme).toBe(true);
      expect(results.validZero).toBe(true);

      // Invalid coordinates should return false
      expect(results.invalidLatHigh).toBe(false);
      expect(results.invalidLatLow).toBe(false);
      expect(results.invalidLonHigh).toBe(false);
      expect(results.invalidLonLow).toBe(false);
      expect(results.invalidNaN).toBe(false);
      expect(results.invalidInfinity).toBe(false);
      expect(results.invalidString).toBe(false);
      expect(results.invalidNull).toBe(false);
    });
  });

  test.describe('getCurrentLocation', () => {
    test('handles geolocation not supported', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { getCurrentLocation } = await import('./js/modules/location.js');

        // Mock navigator.geolocation as undefined
        const originalGeolocation = navigator.geolocation;
        Object.defineProperty(navigator, 'geolocation', {
          value: undefined,
          configurable: true
        });

        try {
          await getCurrentLocation();
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original geolocation
          Object.defineProperty(navigator, 'geolocation', {
            value: originalGeolocation,
            configurable: true
          });
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Geolocation not supported');
    });

    test('handles geolocation errors correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { getCurrentLocation } = await import('./js/modules/location.js');

        // Mock navigator.geolocation with error simulation
        const originalGeolocation = navigator.geolocation;
        const mockGeolocation = {
          getCurrentPosition: (success, error, options) => {
            // Simulate PERMISSION_DENIED error
            setTimeout(() => {
              error({
                code: 1, // PERMISSION_DENIED
                message: 'User denied the request for Geolocation.'
              });
            }, 10);
          }
        };

        Object.defineProperty(navigator, 'geolocation', {
          value: mockGeolocation,
          configurable: true
        });

        try {
          await getCurrentLocation();
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original geolocation
          Object.defineProperty(navigator, 'geolocation', {
            value: originalGeolocation,
            configurable: true
          });
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Location access denied');
    });

    test('handles successful geolocation', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { getCurrentLocation } = await import('./js/modules/location.js');

        // Mock navigator.geolocation with success simulation
        const originalGeolocation = navigator.geolocation;
        const mockGeolocation = {
          getCurrentPosition: (success, error, options) => {
            // Simulate successful location
            setTimeout(() => {
              success({
                coords: {
                  latitude: 40.7128,
                  longitude: -74.0060
                }
              });
            }, 10);
          }
        };

        Object.defineProperty(navigator, 'geolocation', {
          value: mockGeolocation,
          configurable: true
        });

        try {
          const location = await getCurrentLocation();
          return { success: true, location, error: null };
        } catch (error) {
          return { success: false, location: null, error: error.message };
        } finally {
          // Restore original geolocation
          Object.defineProperty(navigator, 'geolocation', {
            value: originalGeolocation,
            configurable: true
          });
        }
      });

      expect(result.success).toBe(true);
      expect(result.location).toEqual({ lat: 40.7128, lon: -74.0060 });
    });
  });

  test.describe('reverseGeocode fallback', () => {
    test('returns coordinate fallback when all methods fail', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { reverseGeocode } = await import('./js/modules/location.js');

        // Mock fetch to always fail
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error('Network error'));

        try {
          const location = await reverseGeocode(40.7128, -74.0060);
          return { success: true, location };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(true);
      expect(result.location.city).toBe('40.7128, -74.0060');
    });
  });

  test.describe('geocodePlace error handling', () => {
    test('throws error when geocoding fails', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { geocodePlace } = await import('./js/modules/location.js');

        // Mock fetch to return error response
        const originalFetch = window.fetch;
        window.fetch = () => Promise.resolve({
          ok: false,
          status: 404
        });

        try {
          await geocodePlace('Nonexistent Place');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('geocoding failed');
    });

    test('throws error when no results returned', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { geocodePlace } = await import('./js/modules/location.js');

        // Mock fetch to return empty results
        const originalFetch = window.fetch;
        window.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] })
        });

        try {
          await geocodePlace('Empty Results Place');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        } finally {
          // Restore original fetch
          window.fetch = originalFetch;
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('no results');
    });
  });

  test.describe('integration with constants', () => {
    test('uses defaultTz from constants', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Import both modules to test integration
        const { validateCoordinates } = await import('./js/modules/location.js');
        const { defaultTz } = await import('./js/core/constants.js');

        return {
          coordinatesValid: validateCoordinates(40.7128, -74.0060),
          hasDefaultTz: typeof defaultTz === 'string' && defaultTz.length > 0
        };
      });

      expect(result.coordinatesValid).toBe(true);
      expect(result.hasDefaultTz).toBe(true);
    });
  });
});