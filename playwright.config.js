import { defineConfig, devices } from '@playwright/test';

const DEFAULT_BROWSERS = ['chromium', 'firefox', 'webkit'];

const envBrowsers = process.env.PLAYWRIGHT_BROWSERS
  ? process.env.PLAYWRIGHT_BROWSERS.split(',')
      .map((browser) => browser.trim().toLowerCase())
      .filter(Boolean)
  : [];

const targetBrowsers = envBrowsers.length > 0 ? envBrowsers : DEFAULT_BROWSERS;

const targetBrowserSet = new Set(targetBrowsers);

const projects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
].filter((project) => targetBrowserSet.has(project.name));

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'retain-on-failure',
  },
  projects,
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:8000/index-modular.html',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  testIgnore: ['**/unit/**'],
});
