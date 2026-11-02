import { defineConfig, devices } from '@playwright/test';

const reportScope = process.env.E2E_CAPTURE === '1' ? 'visual-candidates' : 'dev';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  testIgnore: '**/production/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 45000,
  expect: { timeout: 7000, toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css' } },
  updateSnapshots: 'none',
  snapshotPathTemplate: `{testDir}/visual/baselines/{platform}/${process.env.E2E_BROWSER_CHANNEL || 'chromium'}/{projectName}/{arg}{ext}`,
  outputDir: `artifacts/e2e/${reportScope}/results`,
  reporter: [['list'], ['html', { outputFolder: `artifacts/e2e/${reportScope}/report`, open: 'never' }], ['json', { outputFile: `artifacts/e2e/${reportScope}/results.json` }]],
  use: {
    baseURL: 'http://127.0.0.1:3101',
    browserName: 'chromium',
    channel: process.env.E2E_BROWSER_CHANNEL || undefined,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', testIgnore: ['**/production/**', '**/visual/**'], use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', testIgnore: ['**/production/**', '**/visual/**'], use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'visual', testMatch: '**/visual/*.spec.js', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 } }
  ],
  webServer: {
    command: 'npm run dev:mock -- --port 3101 --strictPort',
    url: 'http://127.0.0.1:3101/login',
    reuseExistingServer: false,
    timeout: 60000,
    stdout: 'pipe',
    stderr: 'pipe'
  }
});
