import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // Use 4 workers in CI (optimal for 3 vCPU with I/O-bound tests)
  workers: process.env.CI ? 4 : undefined,
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
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npx http-server -p 8000 --silent',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 30 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  testIgnore: ['**/unit/**'],
});
