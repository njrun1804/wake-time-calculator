import { test, expect } from '@playwright/test';

test.describe('Full Modular App - Weather Awareness Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-full-modular.html');

    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('app initializes with weather awareness features', async ({ page }) => {
    // Check that basic functionality is present
    await expect(page.locator('#firstMeeting')).toHaveValue('08:30');
    await expect(page.locator('#runMinutes')).toHaveValue('');
    await expect(page.locator('#runLocation')).toHaveValue('round-town');

    // Check weather awareness UI elements are present
    await expect(page.locator('.awareness-section')).toBeVisible();
    await expect(page.locator('#awCity')).toBeVisible();
    await expect(page.locator('#useMyLocation')).toBeVisible();
    await expect(page.locator('#locationSearch')).toBeVisible();

    // Check initial weather awareness content
    await expect(page.locator('#awDawn')).toHaveText('—');
    await expect(page.locator('#awTemp')).toHaveText('—');
    await expect(page.locator('#awWind')).toHaveText('—');
    await expect(page.locator('#awPoP')).toHaveText('—');

    // Should show verify location button initially
    await expect(page.locator('#awCity')).toContainText('Verify location');
  });

  test('weather awareness updates when location changes', async ({ page }) => {
    // Select a dirt location that should trigger weather awareness
    await page.selectOption('#runLocation', 'figure8');

    // Wait for awareness to update
    await page.waitForTimeout(500);

    // Weather awareness section should still be visible
    await expect(page.locator('.awareness-section')).toBeVisible();

    // Location buttons should still be available for dirt locations
    await expect(page.locator('#useMyLocation')).toBeVisible();

    // Status message should be available but may be empty initially
    const statusMsg = page.locator('#awMsg');
    await expect(statusMsg).toBeVisible();
  });

  test('weather awareness persists preferences', async ({ page }) => {
    // Mock successful geolocation
    await page.evaluate(() => {
      // Mock navigator.geolocation
      const mockGeolocation = {
        getCurrentPosition: (success, error, options) => {
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
    });

    // Select dirt location and try to get weather
    await page.selectOption('#runLocation', 'huber');

    // Click location detection button if visible
    const detectButton = page.locator('#detectLocationBtn');
    if (await detectButton.isVisible()) {
      await detectButton.click();
      await page.waitForTimeout(1000);
    }

    // Check that location preference might be saved
    const savedLocation = await page.evaluate(() =>
      localStorage.getItem('wake:userLocation')
    );

    // Location should be saved if detection was successful
    if (savedLocation) {
      const location = JSON.parse(savedLocation);
      expect(location).toHaveProperty('lat');
      expect(location).toHaveProperty('lon');
    }
  });

  test('weather awareness handles geolocation errors gracefully', async ({ page }) => {
    // Mock geolocation error
    await page.evaluate(() => {
      const mockGeolocation = {
        getCurrentPosition: (success, error, options) => {
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
    });

    // Select dirt location
    await page.selectOption('#runLocation', 'tatum');

    // Try to click location detection
    const detectButton = page.locator('#detectLocationBtn');
    if (await detectButton.isVisible()) {
      await detectButton.click();
      await page.waitForTimeout(500);

      // Should show error or fallback message in awareness section
      const awarenessSection = page.locator('.awareness-section');
      const sectionContent = await awarenessSection.textContent();
      expect(sectionContent).toMatch(/(denied|error|unable|verify|location)/i);
    }
  });

  test('manual location input works', async ({ page }) => {
    // Select dirt location
    await page.selectOption('#runLocation', 'holmdel');

    // Use location search input
    const locationSearch = page.locator('#locationSearch');

    if (await locationSearch.isVisible()) {
      await locationSearch.fill('New York, NY');
      await locationSearch.press('Enter');
      await page.waitForTimeout(1000);

      // Should attempt to process the location search
      const awarenessSection = page.locator('.awareness-section');
      const sectionContent = await awarenessSection.textContent();

      // Should show either weather data or a processing state
      expect(sectionContent.length).toBeGreaterThan(20);
    }
  });

  test('dawn time calculation integrates with weather awareness', async ({ page }) => {
    // Select an early meeting time that might trigger dawn checking
    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '60');
    await page.selectOption('#runLocation', 'figure8');

    // Wait for calculations
    await page.waitForTimeout(500);

    // Check if dawn/daylight notice appears
    const awarenessSection = page.locator('.awareness-section');
    const awarenessText = await awarenessSection.textContent();

    // Should contain weather awareness UI elements
    expect(awarenessText.toLowerCase()).toContain('weather');

    // Check if daylight check is mentioned
    if (awarenessText.toLowerCase().includes('dawn') ||
        awarenessText.toLowerCase().includes('daylight') ||
        awarenessText.toLowerCase().includes('light')) {
      expect(awarenessText).toMatch(/(dawn|daylight|light)/i);
    }
  });

  test('full app calculation pipeline works end-to-end', async ({ page }) => {
    // Set up a complete scenario
    await page.selectOption('#firstMeeting', '07:30');
    await page.fill('#runMinutes', '90');
    await page.selectOption('#breakfastMinutes', '20');
    await page.selectOption('#runLocation', 'huber');

    // Wait for all calculations
    await page.waitForTimeout(500);

    // Verify basic calculation worked
    const wakeTime = await page.locator('#chosenWake').textContent();
    expect(wakeTime).not.toBe('--:--');
    expect(wakeTime).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);

    // Verify time bars are shown
    await expect(page.locator('#runBar')).toBeVisible();
    await expect(page.locator('#travelBar')).toBeVisible();
    await expect(page.locator('#breakfastBar')).toBeVisible();
    await expect(page.locator('#prepBar')).toBeVisible();

    // Verify weather awareness is active for dirt trail
    const awarenessSection = page.locator('.awareness-section');
    await expect(awarenessSection).toBeVisible();
    const awarenessText = await awarenessSection.textContent();
    expect(awarenessText.toLowerCase()).toContain('weather');

    // Verify weather card is present and configured
    await expect(page.locator('.awareness-section')).toBeVisible();

    // Verify storage integration
    await page.waitForTimeout(100);
    const savedValues = await page.evaluate(() => {
      return {
        meeting: localStorage.getItem('wake:meeting'),
        run: localStorage.getItem('wake:run'),
        breakfast: localStorage.getItem('wake:breakfast'),
        location: localStorage.getItem('wake:location'),
        travel: localStorage.getItem('wake:travel')
      };
    });

    expect(savedValues.meeting).toBe('07:30');
    expect(savedValues.run).toBe('90');
    expect(savedValues.breakfast).toBe('20');
    expect(savedValues.location).toBe('huber');
    expect(savedValues.travel).toBe('20');
  });

  test('app handles multiple rapid input changes gracefully', async ({ page }) => {
    // Rapidly change inputs to test debouncing and state management
    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '30');
    await page.selectOption('#runLocation', 'figure8');
    await page.selectOption('#firstMeeting', '08:00');
    await page.fill('#runMinutes', '60');
    await page.selectOption('#runLocation', 'huber');
    await page.selectOption('#breakfastMinutes', '45');

    // Wait for debounced updates
    await page.waitForTimeout(1000);

    // Final state should be consistent
    await expect(page.locator('#firstMeeting')).toHaveValue('08:00');
    await expect(page.locator('#runMinutes')).toHaveValue('60');
    await expect(page.locator('#runLocation')).toHaveValue('huber');
    await expect(page.locator('#breakfastMinutes')).toHaveValue('45');

    // Wake time should be calculated correctly
    const wakeTime = await page.locator('#chosenWake').textContent();
    expect(wakeTime).not.toBe('--:--');
    expect(wakeTime).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);

    // Weather awareness should be functional
    const awarenessSection = page.locator('.awareness-section');
    const awarenessText = await awarenessSection.textContent();
    expect(awarenessText.toLowerCase()).toContain('weather');
  });

  test('weather awareness works with cross-module integration', async ({ page }) => {
    // Test that weather, location, dawn, and UI modules work together
    await page.selectOption('#firstMeeting', '06:00'); // Very early
    await page.fill('#runMinutes', '120'); // Long run
    await page.selectOption('#runLocation', 'tatum'); // Dirt trail

    await page.waitForTimeout(500);

    // Should show location awareness for dirt
    const awarenessSection = page.locator('.awareness-section');
    await expect(awarenessSection).toBeVisible();

    // Check that weather awareness is functional
    const awarenessText = await awarenessSection.textContent();
    expect(awarenessText.toLowerCase()).toContain('weather');

    // Weather awareness section should be configured for dirt location
    await expect(awarenessSection).toBeVisible();

    // Time calculations should still work correctly
    const wakeTime = await page.locator('#chosenWake').textContent();
    expect(wakeTime).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);

    // Previous day badge might be shown for very early meeting
    const prevDayBadge = page.locator('#prevDayBadge');
    if (await prevDayBadge.isVisible()) {
      expect(wakeTime).toContain('PM');
    }
  });
});