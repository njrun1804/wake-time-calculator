import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config.js';

/**
 * Manual test grouping configuration for optimized CI sharding
 *
 * Instead of using Playwright's default alphabetical sharding, we manually
 * group tests by estimated execution time to ensure even distribution across shards.
 *
 * Usage in CI: npm run test:visual:grouped -- --shard=X/8
 */

export default defineConfig({
  ...baseConfig,

  projects: [
    // GROUP 1: Accessibility tests (slower - lots of keyboard interactions)
    {
      name: 'group-1-webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/accessibility.spec.js',
      metadata: { group: 1, estimated: 'slow' },
    },
    {
      name: 'group-1-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/accessibility.spec.js',
      metadata: { group: 1, estimated: 'slow' },
    },
    {
      name: 'group-1-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/accessibility.spec.js',
      metadata: { group: 1, estimated: 'slow' },
    },

    // GROUP 2: Responsive tests (medium - viewport changes)
    {
      name: 'group-2-webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/responsive.spec.js',
      metadata: { group: 2, estimated: 'medium' },
    },
    {
      name: 'group-2-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/responsive.spec.js',
      metadata: { group: 2, estimated: 'medium' },
    },
    {
      name: 'group-2-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/responsive.spec.js',
      metadata: { group: 2, estimated: 'medium' },
    },

    // GROUP 3: Weather state tests (slower - complex DOM states)
    {
      name: 'group-3-webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/weather-states.spec.js',
      metadata: { group: 3, estimated: 'slow' },
    },
    {
      name: 'group-3-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/weather-states.spec.js',
      metadata: { group: 3, estimated: 'slow' },
    },
    {
      name: 'group-3-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/weather-states.spec.js',
      metadata: { group: 3, estimated: 'slow' },
    },
  ],
});
