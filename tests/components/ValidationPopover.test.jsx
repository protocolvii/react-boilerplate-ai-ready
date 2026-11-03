import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidationPopover from '@/components/ValidationPopover';
import { Input } from '@/components/ui/input';

describe('ValidationPopover', () => {
  it('保持错误关联，聚焦展示，Escape 关闭，再次提交及聚焦可重新展示', async () => {
    const user = userEvent.setup();
    const example = attempt => (
      <>
        <label htmlFor="example">名称</label>
        <ValidationPopover message="请输入名称" attempt={attempt}>
          <Input id="example" />
        </ValidationPopover>
        <button>其他操作</button>
      </>
    );
    const { rerender } = render(example(1));
    const input = screen.getByLabelText('名称');
    expect(input).toHaveAccessibleDescription('请输入名称');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(input);
    expect(await screen.findByRole('alert')).toHaveTextContent('请输入名称');
    expect(input).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAccessibleDescription('请输入名称');
    rerender(example(2));
    expect(await screen.findByRole('alert')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '其他操作' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(input);
    expect(await screen.findByRole('alert')).toBeVisible();
  });
  it('修正错误后关闭气泡，保留已有辅助说明与输入 ref', async () => {
    const user = userEvent.setup();
    const ref = createRef();
    const example = message => (
      <>
        <span id="hint">格式说明</span>
        <ValidationPopover message={message}>
          <Input ref={ref} aria-label="输入" aria-describedby="hint" />
        </ValidationPopover>
      </>
    );
    const { rerender } = render(example('格式错误'));
    const input = screen.getByLabelText('输入');
    expect(ref.current).toBe(input);
    await user.click(input);
    expect(await screen.findByRole('alert')).toBeVisible();
    rerender(example(''));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAccessibleDescription('格式说明');
  });
});
