import { defineConfig, devices } from '@playwright/test';
import { targetUrl } from '../postdeploy/helpers/target.js';

// Chromium covers Chrome and Edge, WebKit covers Safari.
export default defineConfig({
  testDir: '.',
  outputDir: '../../test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://web',
    viewport: { width: 1024, height: 768 },
    locale: 'pl-PL',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1024, height: 768 } },
    },
    {
      // Checks run after each publication; here they run against `web` (mock mode)
      // unless POSTDEPLOY_URL points at the published game.
      name: 'postdeploy',
      testDir: '../postdeploy',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        baseURL: targetUrl,
      },
    },
  ],
});
