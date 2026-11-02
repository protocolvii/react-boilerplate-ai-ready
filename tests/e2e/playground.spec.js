import { test, expect } from './fixtures.js';
import { choose, openConfig, closeConfig, noPageOverflow } from './helpers.js';
import projectDesign from '../../src/design-system/project-design.json' with { type: 'json' };

test('公开 Playground 支持主题、浅深色、密度与手动颜色预览恢复', async ({ page }) => {
  await page.goto('/design-playground');
  await expect(page.getByRole('heading', { name: 'Design Playground', exact: true })).toBeVisible();
  await openConfig(page);
  for (const [id, name] of [
    ['modern-saas', 'Modern SaaS'],
    ['industrial-pro', 'Industrial Pro'],
    ['creative-ai', 'Creative AI']
  ]) {
    await choose(page, '设计预设', name);
    await expect(page.locator('html')).toHaveAttribute('data-theme', id);
  }
  for (const [id, name] of [
    ['dark', '深色 Dark'],
    ['light', '浅色 Light']
  ]) {
    await choose(page, '颜色模式', name);
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', id);
  }
  for (const [id, name] of [
    ['comfortable', '舒适 Comfortable'],
    ['compact', '紧凑 Compact'],
    ['default', '标准 Default']
  ]) {
    await choose(page, '信息密度', name);
    await expect(page.locator('html')).toHaveAttribute('data-density', id);
  }
  await page.getByRole('tab', { name: '样式微调', exact: true }).click();
  await page.getByText('主色与界面语义颜色', { exact: true }).click();
  await page.getByLabel('主色', { exact: true }).fill('#ad3377');
  await expect.poll(() => page.locator('html').evaluate(root => getComputedStyle(root).getPropertyValue('--primary').trim())).toBe('#ad3377');
  await page.getByRole('button', { name: '恢复项目配置', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', projectDesign.appearance.preset);
  await expect(page.locator('html')).toHaveAttribute('data-color-mode', projectDesign.appearance.colorMode);
  await expect(page.locator('html')).toHaveAttribute('data-density', projectDesign.appearance.density);
  await expect(page.getByLabel('主色', { exact: true })).toHaveValue('');
  await closeConfig(page);
});

test('通用列表搜索正常和空数据，新增弹窗可操作，页面无横向溢出', async ({ page, isMobile }) => {
  await page.goto('/design-playground?view=list');
  const list = page.getByRole('region', { name: '项目列表', exact: true });
  await expect(list.getByRole('cell', { name: 'ITEM-001', exact: true })).toBeAttached();
  await page.getByLabel('项目名称', { exact: true }).fill('不存在的项目-e2e');
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(list.getByText('没有匹配的项目', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(list.getByRole('cell', { name: 'ITEM-001', exact: true })).toBeAttached();
  await noPageOverflow(page);
  await page.getByRole('button', { name: '新增项目', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '新增项目', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '新增项目', exact: true })).toBeHidden();
  if (isMobile) {
    await page.getByRole('button', { name: '展开筛选', exact: true }).click();
    await page.getByRole('button', { name: '创建日期结束', exact: true }).click();
    await expect(page.getByRole('grid')).toBeVisible();
    await noPageOverflow(page);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '收起筛选', exact: true }).click();
    await page
      .getByRole('button', { name: /^更多操作：/ })
      .first()
      .click();
    await expect(page.getByRole('menuitem', { name: '详情', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }
});

test('桌面与触屏横竖屏导航正常，组件库和模板可切换', async ({ page, isMobile }) => {
  await page.goto('/design-playground');
  await expect(page.getByRole('tab', { name: '页面模板', exact: true })).toBeVisible();
  await choose(page, '选择页面模板', '工业监测');
  await expect(page.locator('[data-page-id="monitoring"]')).toBeVisible();
  await page.getByRole('tab', { name: '组件库', exact: true }).click();
  await expect(page.getByLabel('搜索组件', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '页面模板', exact: true }).click();
  await expect(page.locator('[data-page-id="monitoring"]')).toBeVisible();
  await noPageOverflow(page);
  const opener = page.getByRole('button', { name: '打开导航', exact: true });
  if (isMobile) {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 }
    ]) {
      await page.setViewportSize(viewport);
      await opener.click();
      const drawer = page.getByRole('dialog', { name: '工作区导航', exact: true });
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('link', { name: '控制台', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();
      await noPageOverflow(page);
    }
  } else {
    await expect(opener).toBeHidden();
    await page.getByRole('button', { name: '收起菜单', exact: true }).click();
    await expect(page.getByRole('button', { name: '展开菜单', exact: true })).toBeVisible();
  }
});
