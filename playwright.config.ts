import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4173/driving_game/' },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 7 landscape'] } },
    { name: 'webkit', use: { ...devices['iPhone 14 landscape'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/driving_game/',
  },
});
