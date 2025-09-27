/**
 * CDN Mock Helper for Performance Tests
 * Intercepts CDN requests to speed up tests in CI
 */

export const mockCDNResources = async (page) => {
  if (!process.env.CI) return;

  // Mock Tailwind CSS with minimal styles
  await page.route('**/cdn.tailwindcss.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '/* Mocked Tailwind CSS for testing */',
    });
  });

  // Mock DaisyUI CSS with minimal styles
  await page.route('**/cdn.jsdelivr.net/npm/daisyui@**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/css',
      body: '/* Mocked DaisyUI for testing */',
    });
  });
};