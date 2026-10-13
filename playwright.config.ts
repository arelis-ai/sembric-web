import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL points the suite at a running container or deployment; otherwise it serves ./dist locally with the
// same headers nginx sends.
const external = process.env.E2E_BASE_URL;
const baseURL = external ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: external
    ? undefined
    : { command: 'node scripts/serve.mjs 4173', url: 'http://127.0.0.1:4173/', reuseExistingServer: !process.env.CI },
});
