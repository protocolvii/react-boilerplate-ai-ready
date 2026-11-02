import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/production/*.spec.js',
  outputDir: 'artifacts/e2e/production/results',
  reporter: [['list'], ['html', { outputFolder: 'artifacts/e2e/production/report', open: 'never' }], ['json', { outputFile: 'artifacts/e2e/production/results.json' }]],
  use: { ...base.use, baseURL: 'http://127.0.0.1:4175' },
  projects: [{ name: 'production', use: { viewport: { width: 1440, height: 1000 } } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175/login',
    reuseExistingServer: false,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe'
  }
});
