import { test, expect } from '../fixtures.js';
import { login } from '../helpers.js';
import { createConfig } from '../../../src/config.js';

// 仅用于生产浏览器测试的接口桩，不修改构建产物，不连接正式后端。
async function backendStub(page) {
  const api = createConfig('prod').apiUrl;
  await page.route(`${api}/**`, async route => {
    const request = route.request();
    const path = request.url().slice(api.length);
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (path === '/authorizations' && request.method() === 'POST') {
      return route.fulfill({ json: { errcode: 0, errmsg: 'ok', id: 'production-test', access_token: 'test-only-access', refresh_token: 'test-only-refresh', expires_in: 7200 }, headers });
    }
    if (path === '/user' && request.method() === 'GET') return route.fulfill({ json: { errcode: 0, errmsg: 'ok', id: 1, username: 'admin' }, headers });
    return route.fulfill({ status: 404, json: { errcode: 404, errmsg: 'unconfigured test endpoint' }, headers });
  });
}

test('生产构建无 Playground、设计写入接口和 Mock API', async ({ page, request }) => {
  await page.goto('/design-playground');
  await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Design Playground', exact: true })).toHaveCount(0);
  expect((await request.post('/__design-project', { data: {} })).status()).toBe(404);
  expect((await request.post('/api/authorizations', { data: { username: 'admin', password: 'admin123' } })).status()).toBe(404);
  await page.goto('/getting-started');
  await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.getByLabel('用户名', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('生产首页与修改密码路由正常，登录后仍无设计入口', async ({ page }) => {
  await backendStub(page);
  await login(page, { heading: '首页' });
  await expect(page.locator('header [data-slot="app-logo"]')).toBeVisible();
  expect(await page.evaluate(async () => (await fetch(document.querySelector('link[rel="icon"]').href)).ok)).toBe(true);
  await expect(page.locator('header').getByRole('link', { name: '设计系统', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '打开设计系统', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '先确定项目外观', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '开发工具', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '使用向导', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '打开设计配置', exact: true })).toHaveCount(0);
  await page.goto('/change-password');
  await expect(page.getByLabel('原密码', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('原密码', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/change-password');
});
