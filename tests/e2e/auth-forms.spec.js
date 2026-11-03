import { test, expect } from './fixtures.js';
import { login, noPageOverflow, stablePage, choose, openConfig, closeConfig } from './helpers.js';

async function screenshot(page, testInfo, name) {
  await stablePage(page);
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

test('登录必填使用字段提示，不显示原生气泡或发送请求', async ({ page }, testInfo) => {
  let requests = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().endsWith('/api/authorizations')) requests++;
  });
  await page.goto('/login');
  const username = page.getByLabel('用户名', { exact: true });
  await expect(username.locator('xpath=ancestor::form')).toHaveAttribute('novalidate', '');
  const before = await username.locator('xpath=ancestor::form').boundingBox();
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '请输入用户名' })).toBeVisible();
  await expect(page.getByLabel('密码', { exact: true })).toHaveAccessibleDescription('请输入密码');
  const after = await username.locator('xpath=ancestor::form').boundingBox();
  expect(after.height).toBe(before.height);
  await expect(username).toBeFocused();
  await expect(username).toHaveAttribute('aria-invalid', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '校验提示' })).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: '请输入用户名' })).toBeVisible();
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '请输入用户名' })).toBeVisible();
  await username.fill('admin');
  await expect(username).toHaveAttribute('aria-invalid', 'false');
  await page.getByLabel('密码', { exact: true }).focus();
  await expect(page.getByRole('alert').filter({ hasText: '请输入密码' })).toBeVisible();
  expect(requests).toBe(0);
  await noPageOverflow(page);
  await screenshot(page, testInfo, 'login-validation');
});

test('修改密码使用统一必填、长度和一致性提示；服务端失败保留输入', async ({ page }, testInfo) => {
  await login(page);
  await page.goto('/change-password');
  const old = page.getByLabel('原密码', { exact: true });
  const password = page.getByLabel('新密码', { exact: true });
  const repeat = page.getByLabel('确认新密码', { exact: true });
  await expect(old.locator('xpath=ancestor::form')).toHaveAttribute('novalidate', '');
  const before = await old.locator('xpath=ancestor::form').boundingBox();
  const buttonBefore = await page.getByRole('button', { name: '提交', exact: true }).boundingBox();
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '请输入原密码' })).toBeVisible();
  await expect(password).toHaveAccessibleDescription('请输入新密码');
  await expect(repeat).toHaveAccessibleDescription('请再次输入新密码');
  const after = await old.locator('xpath=ancestor::form').boundingBox();
  expect(after.height).toBe(before.height);
  const buttonAfter = await page.getByRole('button', { name: '提交', exact: true }).boundingBox();
  expect(buttonAfter.y).toBe(buttonBefore.y);
  await expect(page.getByRole('dialog', { name: '校验提示' })).toHaveCount(0);
  await old.fill('wrong-password');
  await password.fill('123');
  await expect(page.getByRole('alert').filter({ hasText: '新密码至少 6 位' })).toBeVisible();
  await password.fill('new-password');
  await repeat.fill('different-password');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '两次密码输入不一致' })).toBeVisible();
  await screenshot(page, testInfo, 'password-validation');
  await repeat.fill('new-password');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByText('原密码错误', { exact: true })).toBeVisible();
  await expect(old).toHaveValue('wrong-password');
  await expect(password).toHaveValue('new-password');
  await noPageOverflow(page);
  // 浏览器局部接口桩验证成功重置，不修改共享 Mock 账号密码。
  await page.route('**/api/user/password', route => route.fulfill({ json: { errcode: 0, errmsg: 'ok' } }));
  await old.fill('admin123');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByText('密码修改成功', { exact: true })).toBeVisible();
  await expect(old).toHaveValue('');
  await expect(password).toHaveValue('');
  await expect(repeat).toHaveValue('');
});

test('分页错误使用浮层提示，控件保持同一行且不改变高度', async ({ page }, testInfo) => {
  await page.goto('/design-playground?view=list');
  const input = page.getByRole('textbox', { name: '跳转页码', exact: true });
  const before = await input.locator('xpath=ancestor::form').boundingBox();
  await input.fill('5');
  await input.press('Enter');
  const form = input.locator('xpath=ancestor::form');
  await expect(page.getByRole('alert')).toBeVisible();
  const after = await form.boundingBox();
  expect(after.height).toBe(before.height);
  const label = await form.getByText('跳至', { exact: true }).boundingBox();
  const button = await form.getByRole('button', { name: '跳转', exact: true }).boundingBox();
  expect(Math.abs(label.y + label.height / 2 - (button.y + button.height / 2))).toBeLessThan(3);
  const error = page.getByRole('alert');
  const size = await error.evaluate(element => getComputedStyle(element).fontSize);
  expect(parseFloat(size)).toBeLessThanOrEqual(12);
  await noPageOverflow(page);
  await screenshot(page, testInfo, 'pagination-validation');
});

test('公共校验气泡可在组件库预览，支持深色、密度和屏幕边界避让', async ({ page }, testInfo) => {
  await page.goto('/design-playground?view=components');
  await page.getByLabel('搜索组件', { exact: true }).fill('校验气泡');
  await openConfig(page);
  await choose(page, '设计预设', 'Industrial Pro');
  await choose(page, '颜色模式', '深色 Dark');
  await choose(page, '信息密度', '舒适 Comfortable');
  await closeConfig(page);
  const input = page.getByRole('textbox', { name: '校验气泡示例', exact: true });
  const form = input.locator('xpath=ancestor::form');
  const before = await form.boundingBox();
  await input.focus();
  await input.press('Enter');
  await expect(page.getByRole('alert')).toContainText('请输入至少 2 个字符');
  const after = await form.boundingBox();
  expect(after.height).toBe(before.height);
  await expect(input).toBeFocused();
  const heights = await input.evaluate(element => {
    const style = getComputedStyle(element);
    const token = style.getPropertyValue('--control-height').trim();
    const expected = parseFloat(token) * (token.endsWith('rem') ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 1);
    return { actual: element.getBoundingClientRect().height, expected };
  });
  expect(heights.actual).toBeCloseTo(heights.expected, 1);
  const popup = await page.getByRole('dialog', { name: '校验提示' }).boundingBox();
  expect(popup.x).toBeGreaterThanOrEqual(0);
  expect(popup.x + popup.width).toBeLessThanOrEqual(page.viewportSize().width);
  await noPageOverflow(page);
  await screenshot(page, testInfo, 'validation-popover-dark');
});
