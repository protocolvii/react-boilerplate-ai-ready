import { test, expect } from './fixtures.js';
import { login, noPageOverflow, stablePage } from './helpers.js';

for (const [route, name] of [
  ['/', '使用向导'],
  ['/change-password', '修改密码']
]) {
  test(`${name} 内容面板填满剩余高度，保留底部间距并容纳长内容`, async ({ page, isMobile }, testInfo) => {
    await login(page);
    if (route !== '/') await page.goto(route);
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    const content = page.locator('main.ds-main-page .ds-page-content');
    const panel = content.locator('.ds-panel').first();
    const checkBottom = async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      const header = await page.locator('header').boundingBox();
      const breadcrumb = await page.getByRole('navigation', { name: 'breadcrumb', exact: true }).boundingBox();
      expect(breadcrumb.y).toBeGreaterThanOrEqual(header.y + header.height);
      const geometry = await panel.evaluate(element => ({
        bottom: element.getBoundingClientRect().bottom + window.scrollY,
        pageHeight: document.documentElement.scrollHeight,
        spacing: parseFloat(getComputedStyle(element.parentElement).paddingBottom),
        border: parseFloat(getComputedStyle(element).borderBottomWidth)
      }));
      expect(geometry.border).toBeGreaterThan(0);
      expect(Math.abs(geometry.pageHeight - geometry.bottom - geometry.spacing)).toBeLessThanOrEqual(2);
      expect(geometry.spacing).toBeGreaterThan(0);
      await noPageOverflow(page);
    };
    for (const viewport of isMobile
      ? [
          { width: 390, height: 844 },
          { width: 844, height: 390 }
        ]
      : [
          { width: 1440, height: 1000 },
          { width: 1280, height: 900 }
        ]) {
      await page.setViewportSize(viewport);
      await checkBottom();
    }
    await stablePage(page);
    const path = testInfo.outputPath('page-panel.png');
    await page.screenshot({ path, fullPage: true });
    await testInfo.attach('page-panel', { path, contentType: 'image/png' });
    // 用长内容验证自然增高，不依赖固定高度或内部裁剪。
    await panel.locator(':scope > div').evaluate(body => {
      const extra = document.createElement('p');
      extra.textContent = Array(80).fill('长内容示例').join('\n');
      extra.style.whiteSpace = 'pre-wrap';
      body.append(extra);
    });
    await checkBottom();
    expect(await panel.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(page.viewportSize().height);
  });
}
