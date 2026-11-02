import { expect } from './fixtures.js';

export async function login(page) {
  await page.goto('/login');
  await page.getByLabel('用户名', { exact: true }).fill('admin');
  await page.getByLabel('密码', { exact: true }).fill('admin123');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: '控制台', exact: true })).toBeVisible();
}
export async function openConfig(page) {
  await page.getByRole('button', { name: '打开设计配置', exact: true }).click();
  await expect(page.getByRole('heading', { name: '设计配置', exact: true })).toBeVisible();
}
export async function choose(page, label, option) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
export async function closeConfig(page) {
  await page.getByRole('button', { name: '隐藏设计配置', exact: true }).click();
  await expect(page.getByRole('heading', { name: '设计配置', exact: true })).toBeHidden();
}
export async function stablePage(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }' });
  await page.mouse.move(0, 0);
}
export async function noPageOverflow(page) {
  const sizes = await page.evaluate(() => ({ width: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.width + 1);
}
