import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['dot'], ['json', { outputFile: 'test-results.json' }]]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8000',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:8000/index.html',
    reuseExistingServer: true,
    timeout: 30 * 1000,
    stdout: process.env.CI ? 'pipe' : 'ignore',
    stderr: 'pipe',
  },
  testIgnore: ['**/unit/**'],
});
