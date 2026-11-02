import { test, expect } from '../fixtures.js';
import { choose, openConfig, closeConfig, stablePage } from '../helpers.js';

async function compare(page, testInfo, name, target = page) {
  await stablePage(page);
  if (process.env.E2E_CAPTURE === '1') {
    const path = testInfo.outputPath(`${name}-candidate.png`);
    await target.screenshot({ path, animations: 'disabled' });
    await testInfo.attach(`待人工确认-${name}`, { path, contentType: 'image/png' });
  } else {
    await expect(target).toHaveScreenshot(`${name}.png`);
  }
}
for (const [preset, mode, name] of [
  ['Modern SaaS', '浅色 Light', 'modern-saas-light'],
  ['Industrial Pro', '深色 Dark', 'industrial-pro-dark'],
  ['Creative AI', '浅色 Light', 'creative-ai-light']
]) {
  test(name, async ({ page }, testInfo) => {
    await page.clock.setFixedTime(new Date('2026-11-03T00:00:00+08:00'));
    await page.goto('/design-playground?view=list');
    await expect(page.locator('[data-page-id="list"] tbody tr').first()).toBeVisible();
    await openConfig(page);
    await choose(page, '设计预设', preset);
    await choose(page, '颜色模式', mode);
    await choose(page, '信息密度', '标准 Default');
    await choose(page, '页面布局', 'Standard Admin');
    await closeConfig(page);
    await compare(page, testInfo, name);
  });
}
test('data-table', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-11-03T00:00:00+08:00'));
  await page.goto('/design-playground?view=components');
  await page.getByLabel('搜索组件', { exact: true }).fill('DataTable');
  const table = page.locator('[data-component-id="data-table"]');
  await expect(table.getByRole('table')).toBeVisible();
  await openConfig(page);
  await choose(page, '设计预设', 'Modern SaaS');
  await choose(page, '颜色模式', '浅色 Light');
  await choose(page, '信息密度', '标准 Default');
  await closeConfig(page);
  await compare(page, testInfo, 'data-table', table);
});
