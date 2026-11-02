import { test, expect } from './fixtures.js';
import { login } from './helpers.js';

test('Mock 登录后首页正常渲染，刷新保持首页', async ({ page }) => {
  await login(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: '控制台', exact: true })).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('访客不能访问受保护页面，登录后返回原路径', async ({ page }) => {
  await page.goto('/change-password');
  await expect(page.getByLabel('用户名', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/login');
  await page.getByLabel('用户名', { exact: true }).fill('admin');
  await page.getByLabel('密码', { exact: true }).fill('admin123');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByLabel('原密码', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/change-password');
  await page.reload();
  await expect(page.getByLabel('原密码', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/change-password');
});

test('Mock 登录失败显示具体错误，保留输入', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('用户名', { exact: true }).fill('admin');
  await page.getByLabel('密码', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('用户名或密码错误', { exact: true })).toBeVisible();
  await expect(page.getByLabel('用户名', { exact: true })).toHaveValue('admin');
  await expect(page).toHaveURL('/login');
});
