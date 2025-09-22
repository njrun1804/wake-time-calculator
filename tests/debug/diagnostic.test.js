import { test, expect } from '@playwright/test';

test('diagnose modular app loading', async ({ page }) => {
  const errors = [];
  const logs = [];

  // Capture console errors and logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else {
      logs.push(`${msg.type()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });

  try {
    await page.goto('/index-modular.html');

    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(2000);

    // Check what's in the wake time element
    const wakeTime = await page.locator('#chosenWake').textContent();
    console.log('Wake time element content:', wakeTime);

    // Log any errors
    if (errors.length > 0) {
      console.log('Errors found:');
      errors.forEach(error => console.log('-', error));
    }

    // Log some general logs
    if (logs.length > 0) {
      console.log('Console logs:');
      logs.slice(0, 10).forEach(log => console.log('-', log));
    }

    // Check if main elements exist
    const form = await page.locator('#wakeForm').count();
    const chosenWake = await page.locator('#chosenWake').count();
    const runMinutes = await page.locator('#runMinutes').count();

    console.log('Element counts:', { form, chosenWake, runMinutes });

    // Try to check if app was initialized
    const appInitialized = await page.evaluate(() => {
      return typeof window.WakeTimeApp !== 'undefined';
    });

    console.log('App class available:', appInitialized);

  } catch (error) {
    console.log('Test error:', error.message);
  }
});