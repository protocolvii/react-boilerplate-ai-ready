import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import FormExample from '@/containers/DesignPlayground/gallery/previews/FormExample';
import { TooltipProvider } from '@/components/ui/tooltip';
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }));
const missingDOMMethods = [];
beforeAll(() => {
  // jsdom 不执行布局，Radix 需要这些浏览器接口；真实交互另由 Playwright 验证。
  for (const name of ['hasPointerCapture', 'setPointerCapture', 'releasePointerCapture', 'scrollIntoView']) {
    if (!Element.prototype[name]) {
      Object.defineProperty(Element.prototype, name, { configurable: true, value: () => false });
      missingDOMMethods.push(name);
    }
  }
});
afterAll(() => {
  vi.unstubAllGlobals();
  for (const name of missingDOMMethods) delete Element.prototype[name];
});
const record = { name: '编辑配置', capacity: 12, category: 'team', startDate: '2026-06-01', endDate: '2026-06-30', enabled: true };
function mount(props = {}) {
  return render(
    <TooltipProvider>
      <FormExample loadRecord={async () => record} {...props} />
    </TooltipProvider>
  );
}
async function load(user) {
  await user.click(screen.getByRole('button', { name: '载入编辑数据' }));
  await waitFor(() => expect(screen.getByLabelText('配置名称', { exact: true })).toHaveValue(record.name));
}

describe('业务表单示例', () => {
  it('必填与长度、数值范围错误在字段显示，不提交请求', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    mount({ saveRecord: save });
    await user.click(screen.getByRole('button', { name: '保存配置' }));
    expect(await screen.findByText('请输入配置名称')).toBeVisible();
    expect(screen.getByLabelText('配置名称', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('combobox', { name: '配置类型', exact: true })).toHaveAccessibleDescription(/请选择配置类型/);
    await user.type(screen.getByLabelText('配置名称', { exact: true }), 'a');
    expect(await screen.findByText('配置名称至少 2 个字符')).toBeVisible();
    await user.type(screen.getByLabelText('配置数量', { exact: true }), '101');
    expect(await screen.findByText('数量不能大于 100')).toBeVisible();
    expect(save).not.toHaveBeenCalled();
  });
  it('异步回填后 reset 恢复编辑基线，新建恢复空值，禁用不丢值', async () => {
    const user = userEvent.setup();
    mount();
    await load(user);
    const name = screen.getByLabelText('配置名称', { exact: true });
    await user.clear(name);
    await user.type(name, '临时修改');
    await user.click(screen.getByRole('button', { name: '重置', exact: true }));
    expect(name).toHaveValue(record.name);
    await user.click(screen.getByRole('button', { name: '禁用表单' }));
    expect(name).toBeDisabled();
    expect(name).toHaveValue(record.name);
    await user.click(screen.getByRole('button', { name: '启用表单' }));
    expect(name).toBeEnabled();
    await user.click(screen.getByRole('button', { name: '新建配置' }));
    expect(name).toHaveValue('');
    expect(screen.getByLabelText('配置数量', { exact: true })).toHaveValue(null);
  });
  it('Select 和 Switch 受控变化参与提交，成功反馈只触发一次', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => ({}));
    mount({ saveRecord: save });
    await load(user);
    await user.click(screen.getByRole('combobox', { name: '配置类型', exact: true }));
    await user.click(screen.getByRole('option', { name: '个人', exact: true }));
    await user.click(screen.getByRole('switch', { name: '启用配置', exact: true }));
    await user.click(screen.getByRole('button', { name: '保存配置' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ ...record, category: 'personal', enabled: false }, 'success'));
    expect(toast.success).toHaveBeenCalledExactlyOnceWith('配置保存成功');
  });
  it('异步提交期间禁用操作并阻止重复请求', async () => {
    const user = userEvent.setup();
    let complete;
    const save = vi.fn(
      () =>
        new Promise(resolve => {
          complete = resolve;
        })
    );
    mount({ saveRecord: save });
    await load(user);
    const button = screen.getByRole('button', { name: '保存配置' });
    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    await user.click(button);
    fireEvent.submit(screen.getByRole('form', { name: '通用配置表单' }));
    await act(async () => {});
    expect(button).toBeDisabled();
    expect(save).toHaveBeenCalledOnce();
    await act(async () => {
      complete({});
    });
    await waitFor(() => expect(button).toBeEnabled());
  });
  it('服务器字段错误关联具体字段，整体失败使用 Alert 且保留输入', async () => {
    const user = userEvent.setup();
    const save = vi
      .fn()
      .mockResolvedValueOnce({ fieldErrors: { name: '名称已被使用' } })
      .mockRejectedValueOnce(new Error('服务器暂不可用'));
    mount({ saveRecord: save });
    await load(user);
    await user.click(screen.getByRole('button', { name: '保存配置' }));
    expect(await screen.findByText('名称已被使用')).toBeVisible();
    expect(toast.success).not.toHaveBeenCalled();
    const name = screen.getByLabelText('配置名称', { exact: true });
    expect(name).toHaveAccessibleDescription(/名称已被使用/);
    await user.clear(name);
    await user.type(name, '另一个名称');
    await user.click(screen.getByRole('button', { name: '保存配置' }));
    expect(await screen.findByText('服务器暂不可用')).toBeVisible();
    expect(name).toHaveValue('另一个名称');
    expect(toast.error).not.toHaveBeenCalled();
  });
});
