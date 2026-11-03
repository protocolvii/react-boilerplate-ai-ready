import { test, expect } from './fixtures.js';
import { login, noPageOverflow, stablePage } from './helpers.js';

test('使用向导引导可用，默认导航只保留使用向导，账号菜单仍可修改密码', async ({ page, context, isMobile }, testInfo) => {
  await login(page);
  await expect(page.getByRole('heading', { name: '开始使用', exact: true })).toBeVisible();
  await expect(page.getByRole('complementary', { name: '项目简介', exact: true })).toBeVisible();
  await noPageOverflow(page);

  if (isMobile) await page.getByRole('button', { name: '打开导航', exact: true }).click();
  const navigation = isMobile ? page.getByRole('dialog', { name: '工作区导航', exact: true }) : page.locator('.ds-desktop-sidebar');
  await expect(navigation.getByRole('link')).toHaveCount(1);
  await expect(navigation.getByRole('link', { name: '使用向导', exact: true })).toBeVisible();
  if (isMobile) await page.keyboard.press('Escape');

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const [title, expected] of [
    ['创建一个功能', ['AGENTS.md', '设备管理', '模拟数据']],
    ['调整页面样式', ['手机', '设计规范']],
    ['检查使用效果', ['浏览器', '错误提示']],
    ['配置 AI 的组件工具', ['shadcn/ui 官方文档', 'Skill 和 MCP', '保留已有配置']]
  ]) {
    await page.getByRole('button', { name: `复制提示词：${title}`, exact: true }).click();
    const prompt = await page.evaluate(() => navigator.clipboard.readText());
    for (const text of expected) expect(prompt).toContain(text);
  }
  await expect(page.getByText('提示词已复制', { exact: true }).first()).toBeVisible();

  await page.getByRole('link', { name: '打开设计系统', exact: true }).click();
  await expect(page).toHaveURL('/design-playground');
  await expect(page.getByRole('tab', { name: '页面模板', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '开发工具', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: '设计系统', exact: true })).toBeVisible();
  await page.getByRole('menuitem', { name: '使用向导', exact: true }).click();
  await expect(page).toHaveURL('/getting-started');
  await page.reload();
  await expect(page.getByRole('heading', { name: '使用向导', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '项目 GitHub 仓库' })).toHaveAttribute('href', 'https://github.com/ihahoo/react-boilerplate-ai-ready');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '使用向导', exact: true })).toBeVisible();
  if (isMobile) {
    await page.setViewportSize({ width: 844, height: 390 });
    await noPageOverflow(page);
    await expect(page.getByRole('button', { name: '打开导航', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await stablePage(page);
  const path = testInfo.outputPath('home-guide.png');
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach('home-guide', { path, contentType: 'image/png' });
  await page.locator('header').getByRole('button', { name: 'admin', exact: true }).click();
  await page.getByRole('menuitem', { name: '修改密码', exact: true }).click();
  await expect(page).toHaveURL('/change-password');
  await expect(page.getByLabel('原密码', { exact: true })).toBeVisible();
});
