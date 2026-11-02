import { test as base, expect } from '@playwright/test';

// Playwright 每个测试使用独立 BrowserContext，不共享登录缓存和预览草稿。
export const test = base.extend({
  browserDiagnostics: [
    async ({ page, browser }, use, testInfo) => {
      const errors = [];
      const sessions = new Set();
      const sessionReads = [];
      const logs = [];
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      page.on('console', message => {
        logs.push({ type: message.type(), text: message.text() });
      });
      page.on('requestfailed', request => {
        logs.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText });
      });
      page.on('response', response => {
        const url = new URL(response.url());
        if (url.port === '3101' && url.pathname === '/api/authorizations' && response.request().method() === 'POST' && response.ok()) {
          sessionReads.push(
            response
              .json()
              .then(body => {
                if (body.id) sessions.add(body.id);
              })
              .catch(() => {})
          );
        }
      });
      await use();
      await Promise.all(sessionReads);
      for (const id of sessions) {
        await page.request.delete(`/api/authorizations/${encodeURIComponent(id)}`).catch(error => logs.push({ type: 'cleanup', error: error.message }));
      }
      await testInfo.attach('browser-log', { body: JSON.stringify({ browser: browser.version(), channel: process.env.E2E_BROWSER_CHANNEL || 'chromium', platform: process.platform, errors, logs }, null, 2), contentType: 'application/json' });
      expect(errors, '页面存在未捕获的 JavaScript 错误').toEqual([]);
    },
    { auto: true }
  ]
});
export { expect };
