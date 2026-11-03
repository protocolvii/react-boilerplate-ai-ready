import { test, expect } from './fixtures.js';
import { login, noPageOverflow, stablePage } from './helpers.js';
import projectDesign from '../../src/design-system/project-design.json' with { type: 'json' };

// 浏览器 Canvas 解析实际 Token 颜色，验证单色图形与背景的对比度。
async function logoContrast(logo) {
  return logo.evaluate(element => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    const luminance = color => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const primary = luminance(getComputedStyle(element).color);
    const background = luminance(getComputedStyle(element.closest('header')).backgroundColor);
    return contrast(primary, background);
  });
}

for (const preset of ['Modern SaaS', 'Industrial Pro', 'Creative AI']) {
  for (const mode of ['浅色 Light', '深色 Dark']) {
    test(`品牌显示：${preset} / ${mode}`, async ({ page }, testInfo) => {
      const presetId = { 'Modern SaaS': 'modern-saas', 'Industrial Pro': 'industrial-pro', 'Creative AI': 'creative-ai' }[preset];
      const colorMode = mode === '浅色 Light' ? 'light' : 'dark';
      // 仅替换测试浏览器中的配置模块，模拟已保存外观；不写主题源码。
      // Playground 的临时预览在离开时结束，不能用它冒充登录页的项目配置。
      await page.route('**/src/design-system/project-design.json*', route =>
        route.fulfill({
          contentType: 'application/javascript',
          body: `export default ${JSON.stringify({ ...projectDesign, appearance: { ...projectDesign.appearance, preset: presetId, colorMode } })}`
        })
      );
      await page.goto('/design-playground');
      await expect(page.locator('html')).toHaveAttribute('data-theme', presetId);
      await expect(page.locator('html')).toHaveAttribute('data-color-mode', colorMode);
      const header = page.locator('header');
      const identity = header.locator('[data-slot="brand-identity"]');
      const logo = identity.locator('[data-slot="app-logo"]');
      await expect(logo).toBeVisible();
      const geometry = await identity.evaluate(element => {
        const icon = element.firstElementChild.getBoundingClientRect();
        const text = element.lastElementChild.getBoundingClientRect();
        return { size: icon.width, offset: Math.abs(icon.y + icon.height / 2 - text.y - text.height / 2), header: element.closest('header').getBoundingClientRect().height };
      });
      expect(geometry.size).toBe(28);
      expect(geometry.offset).toBeLessThanOrEqual(1);
      expect(geometry.header).toBe(56);
      const contrast = await logoContrast(logo);
      expect(contrast).toBeGreaterThanOrEqual(3);
      const shape = await logo.innerHTML();
      await noPageOverflow(page);
      await stablePage(page);
      const path = testInfo.outputPath('brand-header.png');
      await header.screenshot({ path });
      await testInfo.attach('brand-header', { path, contentType: 'image/png' });
      // 核对登录页实际采用相同的项目外观与图形。
      await header.getByRole('link', { name: '登录', exact: true }).click();
      const loginLogo = page.locator('[data-slot="brand-identity"] [data-slot="app-logo"]');
      await expect(loginLogo).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', presetId);
      await expect(page.locator('html')).toHaveAttribute('data-color-mode', colorMode);
      expect(await loginLogo.innerHTML()).toBe(shape);
      await expect(page.getByLabel('用户名', { exact: true })).toBeVisible();
      await noPageOverflow(page);
      const loginPath = testInfo.outputPath('brand-login.png');
      await page.screenshot({ path: loginPath });
      await testInfo.attach('brand-login', { path: loginPath, contentType: 'image/png' });
    });
  }
}

test('favicon 可加载，窄屏登录后品牌不挤出导航和账号入口', async ({ page }) => {
  await login(page);
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(favicon).toBeTruthy();
  const asset = await page.evaluate(async () => {
    const response = await fetch(document.querySelector('link[rel="icon"]').href);
    const source = await response.text();
    const svg = new DOMParser().parseFromString(source, 'image/svg+xml');
    return { ok: response.ok, root: svg.documentElement.localName, error: !!svg.querySelector('parsererror') };
  });
  expect(asset).toEqual({ ok: true, root: 'svg', error: false });
  await page.setViewportSize({ width: 320, height: 700 });
  await noPageOverflow(page);
  const header = page.locator('header');
  await expect(header.locator('[data-slot="app-logo"]')).toBeVisible();
  await header.getByRole('button', { name: '打开导航', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '工作区导航', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await header.getByRole('button', { name: 'admin', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: '修改密码', exact: true })).toBeVisible();
});
