import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchToolbar from '@/components/SearchToolbar';

function SearchExample({ onSubmit, onExport }) {
  const [value, setValue] = useState('');
  return (
    <SearchToolbar
      value={value}
      onChange={setValue}
      onSubmit={() => onSubmit(value)}
      actions={
        <button type="button" onClick={onExport}>
          导出
        </button>
      }
    />
  );
}

describe('SearchToolbar', () => {
  it('输入只修改草稿，按 Enter 才提交当前搜索条件', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(<SearchExample onSubmit={submit} />);
    const input = screen.getByRole('textbox', { name: '搜索项目' });
    await user.type(input, '设计文档');
    expect(input).toHaveValue('设计文档');
    expect(submit).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(submit).toHaveBeenCalledExactlyOnceWith('设计文档');
  });
  it('搜索按钮提交一次，独立工具操作不触发搜索', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    const onExport = vi.fn();
    render(<SearchExample onSubmit={submit} onExport={onExport} />);
    await user.click(screen.getByRole('button', { name: '搜索', exact: true }));
    expect(submit).toHaveBeenCalledExactlyOnceWith('');
    await user.click(screen.getByRole('button', { name: '导出' }));
    expect(onExport).toHaveBeenCalledOnce();
    expect(submit).toHaveBeenCalledOnce();
  });
});
