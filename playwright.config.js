import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['dot'], ['json', { outputFile: 'test-results.json' }]]
    : [['html', { open: 'never' }]],
  timeout: process.env.CI ? 20 * 1000 : 30 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:8000',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Faster navigation in CI
    navigationTimeout: process.env.CI ? 15000 : 30000,
    actionTimeout: process.env.CI ? 10000 : 15000,
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npx serve -l 8000 -s .',
    url: 'http://localhost:8000/index.html',
    reuseExistingServer: true,
    timeout: 30 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  testIgnore: ['**/unit/**'],
});
