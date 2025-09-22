import { test, expect } from '@playwright/test';

test.describe('Wake Time Calculator - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.CI ? '/wake.html' : 'wake.html');
    await page.waitForLoadState('networkidle');
  });

  test('should calculate wake time correctly with default values', async ({ page }) => {
    await page.selectOption('#firstMeeting', '08:00');
    await page.fill('#runMinutes', '45');
    await page.selectOption('#breakfastMinutes', '20');

    // Form recalculates automatically on input
    await page.waitForTimeout(500);

    const result = await page.locator('#chosenWake').textContent();
    expect(result).not.toBe('--:--');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  test('should handle previous day calculation', async ({ page }) => {
    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '300');
    await page.selectOption('#runLocation', 'holmdel');
    await page.selectOption('#breakfastMinutes', '45');

    await page.waitForTimeout(500);

    const result = await page.locator('#chosenWake').textContent();
    expect(result).not.toBe('--:--');

    const prevDayBadge = await page.locator('#prevDayBadge');
    const isVisible = await prevDayBadge.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should persist form values in localStorage', async ({ page }) => {
    await page.selectOption('#firstMeeting', '07:30');
    await page.fill('#runMinutes', '60');
    await page.selectOption('#breakfastMinutes', '20');
    await page.selectOption('#runLocation', 'figure8');

    await page.waitForTimeout(500);

    const storedValues = await page.evaluate(() => {
      return {
        meeting: localStorage.getItem('wake:first'),
        run: localStorage.getItem('wake:run'),
        breakfast: localStorage.getItem('wake:breakfast'),
        location: localStorage.getItem('wake:location'),
      };
    });

    expect(storedValues.meeting).toBe('07:30');
    expect(storedValues.run).toBe('60');
    expect(storedValues.breakfast).toBe('20');
    expect(storedValues.location).toBe('figure8');
  });

  test('should load persisted values on page reload', async ({ page, context }) => {
    await page.evaluate(() => {
      localStorage.setItem('wake:first', '09:00');
      localStorage.setItem('wake:run', '50');
      localStorage.setItem('wake:breakfast', '10');
      localStorage.setItem('wake:location', 'huber');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#firstMeeting')).toHaveValue('09:00');
    await expect(page.locator('#runMinutes')).toHaveValue('50');
    await expect(page.locator('#breakfastMinutes')).toHaveValue('10');
    await expect(page.locator('#runLocation')).toHaveValue('huber');
  });

  test('should handle midnight crossing correctly', async ({ page }) => {
    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '60');
    await page.selectOption('#breakfastMinutes', '20');

    await page.waitForTimeout(500);

    const result = await page.locator('#chosenWake').textContent();
    expect(result).not.toBe('--:--');

    const prevDayBadge = await page.locator('#prevDayBadge');
    const isVisible = await prevDayBadge.isVisible();

    // Check if we crossed midnight
    if (isVisible) {
      const badgeText = await prevDayBadge.textContent();
      expect(badgeText).toContain('previous day');
    }
  });

  test('should validate time input format', async ({ page }) => {
    // Run minutes input should be of type number and accept only numeric values
    const inputType = await page.locator('#runMinutes').getAttribute('type');
    expect(inputType).toBe('number');

    // Should accept valid numeric input
    await page.fill('#runMinutes', '45');
    const validValue = await page.locator('#runMinutes').inputValue();
    expect(validValue).toBe('45');

    // Should not accept negative values due to min="0" attribute
    const minValue = await page.locator('#runMinutes').getAttribute('min');
    expect(minValue).toBe('0');
  });

  test('should handle empty optional fields gracefully', async ({ page }) => {
    await page.selectOption('#firstMeeting', '08:00');
    await page.fill('#runMinutes', '45');
    await page.selectOption('#breakfastMinutes', '0'); // None

    await page.waitForTimeout(500);

    const result = await page.locator('#chosenWake');
    await expect(result).toBeVisible();
    const resultText = await result.textContent();
    expect(resultText).not.toBe('--:--');
    expect(resultText).toMatch(/\d{1,2}:\d{2}/);
  });

  test('should update travel time when location changes', async ({ page }) => {
    await page.selectOption('#runLocation', 'figure8');
    await page.waitForTimeout(200);

    // Travel minutes is a hidden field that gets updated automatically
    const travel1 = await page.locator('#travelMinutes').inputValue();
    expect(travel1).toBe('14');

    await page.selectOption('#runLocation', 'holmdel');
    await page.waitForTimeout(200);

    const travel2 = await page.locator('#travelMinutes').inputValue();
    expect(travel2).toBe('50');

    await page.selectOption('#runLocation', 'round-town');
    await page.waitForTimeout(200);

    const travel3 = await page.locator('#travelMinutes').inputValue();
    expect(travel3).toBe('0');
  });

  test('should display breakdown of time components', async ({ page }) => {
    await page.selectOption('#firstMeeting', '08:00');
    await page.fill('#runMinutes', '45');
    await page.selectOption('#breakfastMinutes', '20');
    await page.selectOption('#runLocation', 'figure8');

    await page.waitForTimeout(500);

    // Check if time bars are visible and contain text
    const runBar = await page.locator('#runBar');
    await expect(runBar).toBeVisible();

    const runBarText = await page.locator('#runBarText').textContent();
    expect(runBarText).toContain('Run');

    const breakfastBar = await page.locator('#breakfastBar');
    await expect(breakfastBar).toBeVisible();

    const travelBar = await page.locator('#travelBar');
    await expect(travelBar).toBeVisible();
  });
});