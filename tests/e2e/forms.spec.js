import { test, expect } from './fixtures.js';
import { choose, openConfig, closeConfig, noPageOverflow, stablePage } from './helpers.js';

async function openForm(page) {
  await page.goto('/design-playground?view=components');
  await page.getByLabel('搜索组件', { exact: true }).fill('Form');
  const form = page.locator('[data-component-id="form"]');
  await expect(form).toBeVisible();
  return form;
}
async function load(form) {
  await form.getByRole('button', { name: '载入编辑数据', exact: true }).click();
  await expect(form.getByLabel('配置名称', { exact: true })).toHaveValue('协作空间配置');
}

test('业务表单字段校验、受控输入、异步保存与失败反馈', async ({ page }) => {
  const form = await openForm(page);
  await form.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '请输入配置名称' })).toBeVisible();
  await expect(form.getByLabel('配置名称', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await load(form);
  await choose(page, '配置类型', '个人');
  await form.getByLabel('配置数量', { exact: true }).fill('101');
  await form.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '数量不能大于 100' })).toBeVisible();
  await form.getByLabel('配置数量', { exact: true }).fill('3');
  await form.getByRole('switch', { name: '启用配置', exact: true }).click();
  await form.getByLabel('开始日期', { exact: true }).click();
  await expect(page.getByRole('grid')).toBeVisible();
  await page
    .getByRole('grid')
    .getByRole('button', { name: /2026年6月2日/ })
    .click();
  await expect(form.getByLabel('开始日期', { exact: true })).toContainText('2026-06-02');
  await form.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(form.getByRole('button', { name: '保存中…', exact: true })).toBeDisabled();
  await expect(page.getByText('配置保存成功', { exact: true })).toBeVisible();
  await form.getByLabel('模拟提交结果', { exact: true }).selectOption('field-error');
  await form.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: '该配置名称已存在，请更换名称' })).toBeVisible();
  await form.getByLabel('配置名称', { exact: true }).fill('新的配置名称');
  await form.getByLabel('模拟提交结果', { exact: true }).selectOption('failure');
  await form.getByRole('button', { name: '保存配置', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('保存失败，请稍后重试');
  await expect(form.getByLabel('配置名称', { exact: true })).toHaveValue('新的配置名称');
  await form.getByRole('button', { name: '重置', exact: true }).click();
  await expect(form.getByLabel('配置名称', { exact: true })).toHaveValue('协作空间配置');
  await noPageOverflow(page);
});

test('分页无原生气泡，范围和整数错误就近显示，Enter 与按钮均可跳转', async ({ page }) => {
  await page.goto('/design-playground?view=list');
  const input = page.getByRole('textbox', { name: '跳转页码', exact: true });
  const form = input.locator('xpath=ancestor::form');
  await expect(form).toHaveAttribute('novalidate', '');
  for (const value of ['999', '0', '1.5', '']) {
    await input.fill(value);
    await input.press('Enter');
    await expect(page.getByRole('alert')).toContainText('之间的整数页码');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  }
  await input.fill('2');
  await input.press('Enter');
  await expect(page.getByText('2 / 4', { exact: true })).toBeVisible();
  await input.fill('3');
  await form.getByRole('button', { name: '跳转', exact: true }).click();
  await expect(page.getByText('3 / 4', { exact: true })).toBeVisible();
  await noPageOverflow(page);
});

for (const [preset, density] of [
  ['Modern SaaS', '标准 Default'],
  ['Industrial Pro', '紧凑 Compact'],
  ['Creative AI', '舒适 Comfortable']
]) {
  for (const mode of ['浅色 Light', '深色 Dark']) {
    test(`表单字段反馈显示：${preset} / ${mode} / ${density}`, async ({ page }, testInfo) => {
      const form = await openForm(page);
      await openConfig(page);
      await choose(page, '设计预设', preset);
      await choose(page, '颜色模式', mode);
      await choose(page, '信息密度', density);
      await closeConfig(page);
      await form.getByRole('button', { name: '保存配置', exact: true }).click();
      const name = form.getByLabel('配置名称', { exact: true });
      await expect(name).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByRole('alert').filter({ hasText: '请输入配置名称' })).toBeVisible();
      await form.getByRole('button', { name: '禁用表单', exact: true }).click();
      await expect(name).toBeDisabled();
      await form.getByRole('button', { name: '启用表单', exact: true }).click();
      await expect(name).toBeEnabled();
      await noPageOverflow(page);
      await stablePage(page);
      const path = testInfo.outputPath('form-feedback.png');
      await page.screenshot({ path, fullPage: true });
      await testInfo.attach('form-feedback', { path, contentType: 'image/png' });
    });
  }
}
