import { test, expect } from '@playwright/test';

test.describe('Modular Architecture Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-modular.html');

    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('app initializes with default values', async ({ page }) => {
    // Check that the app loaded
    await expect(page.locator('#firstMeeting')).toHaveValue('08:30');
    await expect(page.locator('#runMinutes')).toHaveValue('');
    await expect(page.locator('#breakfastMinutes')).toHaveValue('0');
    await expect(page.locator('#runLocation')).toHaveValue('round-town');

    // Check wake time is displayed
    const wakeTime = await page.locator('#chosenWake').textContent();
    expect(wakeTime).not.toBe('--:--');
  });

  test('calculates wake time correctly', async ({ page }) => {
    // Set a meeting time
    await page.selectOption('#firstMeeting', '09:00');

    // Add run time
    await page.fill('#runMinutes', '60');

    // Select breakfast
    await page.selectOption('#breakfastMinutes', '20');

    // Check that wake time updated
    const wakeTime = await page.locator('#chosenWake').textContent();
    expect(wakeTime).toContain('AM');
    expect(wakeTime).not.toBe('--:--');

    // Check time bars are shown
    await expect(page.locator('#runBar')).toBeVisible();
    await expect(page.locator('#breakfastBar')).toBeVisible();
  });

  test('persists values to localStorage', async ({ page }) => {
    // Set values
    await page.selectOption('#firstMeeting', '10:00');
    await page.fill('#runMinutes', '45');
    await page.selectOption('#breakfastMinutes', '10');
    await page.selectOption('#runLocation', 'huber');

    // Wait for save
    await page.waitForTimeout(100);

    // Check localStorage
    const savedValues = await page.evaluate(() => {
      return {
        meeting: localStorage.getItem('wake:meeting'),
        run: localStorage.getItem('wake:run'),
        breakfast: localStorage.getItem('wake:breakfast'),
        location: localStorage.getItem('wake:location'),
        travel: localStorage.getItem('wake:travel')
      };
    });

    expect(savedValues.meeting).toBe('10:00');
    expect(savedValues.run).toBe('45');
    expect(savedValues.breakfast).toBe('10');
    expect(savedValues.location).toBe('huber');
    expect(savedValues.travel).toBe('20'); // huber has 20 min travel
  });

  test('loads saved values on refresh', async ({ page }) => {
    // Set values in localStorage
    await page.evaluate(() => {
      localStorage.setItem('wake:meeting', '07:00');
      localStorage.setItem('wake:run', '30');
      localStorage.setItem('wake:breakfast', '45');
      localStorage.setItem('wake:location', 'tatum');
      localStorage.setItem('wake:travel', '36');
    });

    // Reload page
    await page.reload();

    // Check values loaded
    await expect(page.locator('#firstMeeting')).toHaveValue('07:00');
    await expect(page.locator('#runMinutes')).toHaveValue('30');
    await expect(page.locator('#breakfastMinutes')).toHaveValue('45');
    await expect(page.locator('#runLocation')).toHaveValue('tatum');
  });

  test('handles previous day calculation', async ({ page }) => {
    // Set very early meeting with lots of activities to force previous day
    await page.selectOption('#firstMeeting', '06:00');
    await page.fill('#runMinutes', '300'); // 5 hours
    await page.selectOption('#breakfastMinutes', '45');
    await page.selectOption('#runLocation', 'holmdel'); // 50 min travel

    // Check previous day badge is shown
    await expect(page.locator('#prevDayBadge')).toBeVisible();

    const wakeTime = await page.locator('#chosenWake').textContent();
    expect(wakeTime).toContain('PM');
  });

  test('time bars update with correct proportions', async ({ page }) => {
    // Set specific values
    await page.fill('#runMinutes', '60');
    await page.selectOption('#breakfastMinutes', '20');
    await page.selectOption('#runLocation', 'huber'); // 20 min travel

    // Wait for update
    await page.waitForTimeout(100);

    // Check bars are visible
    await expect(page.locator('#runBar')).toBeVisible();
    await expect(page.locator('#travelBar')).toBeVisible();
    await expect(page.locator('#breakfastBar')).toBeVisible();
    await expect(page.locator('#prepBar')).toBeVisible();

    // Check bar text
    const runBarText = await page.locator('#runBarText').textContent();
    expect(runBarText).toBe('Run 60m');

    const travelBarText = await page.locator('#travelBarText').textContent();
    expect(travelBarText).toBe('Travel 20m');

    const breakfastBarText = await page.locator('#breakfastBarText').textContent();
    expect(breakfastBarText).toBe('Breakfast 20m');
  });

  test('latest wake and run start times update correctly', async ({ page }) => {
    await page.selectOption('#firstMeeting', '08:00');
    await page.fill('#runMinutes', '45');

    // Check latest wake and run start are displayed
    const latestWake = await page.locator('#latestWake').textContent();
    const runStart = await page.locator('#runStart').textContent();

    expect(latestWake).not.toBe('--:--');
    expect(runStart).not.toBe('--:--');
    expect(latestWake).toContain('AM');
    expect(runStart).toContain('AM');
  });
});