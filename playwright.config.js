import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // Optimize workers: 75% of cores locally, 100% in CI (I/O-bound tests benefit from oversubscription)
  workers: process.env.CI ? '100%' : '75%',
  reporter: process.env.CI
    ? [['dot'], ['json', { outputFile: 'test-results.json' }]]
    : [['html', { open: 'never' }]],
  timeout: process.env.CI ? 20 * 1000 : 30 * 1000,
  expect: {
    timeout: process.env.CI ? 12000 : 5000,
  },
  use: {
    baseURL: 'http://localhost:8000',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Faster navigation in CI
    navigationTimeout: process.env.CI ? 15000 : 30000,
    actionTimeout: process.env.CI ? 10000 : 15000,
    // Enable browser HTTP cache
    bypassCSP: false,
    offline: false,
    ignoreHTTPSErrors: false,
    extraHTTPHeaders: {},
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npx http-server src -p 8000 --silent -c3600',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 30 * 1000,
    stdout: 'ignore',
    stderr: process.env.CI ? 'ignore' : 'pipe',
  },
  testIgnore: ['**/unit/**'],
});
