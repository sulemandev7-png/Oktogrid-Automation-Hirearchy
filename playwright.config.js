// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests/specs',

  /* Global timeout per test */
  timeout: 60_000,

  /* Timeout for each expect() assertion */
  expect: { timeout: 15_000 },

  /* Run test files in parallel; each file is sequential by default */
  fullyParallel: false,

  /* Fail CI build if test.only was accidentally committed */
  forbidOnly: !!process.env.CI,

  /* Retry once locally so flaky network issues don't fail the run */
  retries: process.env.CI ? 2 : 1,

  /* Single worker locally keeps execution predictable for UI flows */
  workers: 1,

  /* Rich HTML report + console summary */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://dev-platform.oktogrid.io',

    /* Always capture trace so any failure is diagnosable */
    trace: 'retain-on-failure',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on first retry */
    video: 'retain-on-failure',

    /* Generous navigation timeout for slow staging environments */
    navigationTimeout: 60_000,

    /* Action timeout covers clicks, fills, etc. */
    actionTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});