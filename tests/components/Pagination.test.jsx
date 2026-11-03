import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '@/components/Pagination';

describe('分页跳转', () => {
  it.each(['', '0', '7', '-1', '1.5', 'abc'])('无效页码 %s 显示字段错误且不跳转', async value => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Pagination page={1} perPage={10} total={56} onChange={change} />);
    const input = screen.getByRole('textbox', { name: '跳转页码' });
    await user.clear(input);
    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: '跳转', exact: true }));
    expect(input.closest('form')).toHaveAttribute('novalidate');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('请输入 1～6 之间的整数页码');
    expect(change).not.toHaveBeenCalled();
  });
  it('Enter 和点击均以原有 page/perPage 协议跳转，修正输入后清除错误', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Pagination page={1} perPage={20} total={56} onChange={change} />);
    const input = screen.getByRole('textbox', { name: '跳转页码' });
    await user.clear(input);
    await user.type(input, '99{Enter}');
    expect(change).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, '2{Enter}');
    expect(change).toHaveBeenLastCalledWith(2, 20);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '跳转', exact: true }));
    expect(change).toHaveBeenCalledTimes(2);
  });
  it('总页数变化使用最新范围校验，翻页后显示当前页', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<Pagination page={1} perPage={10} total={56} onChange={change} />);
    const input = screen.getByRole('textbox', { name: '跳转页码' });
    await user.clear(input);
    await user.type(input, '5');
    rerender(<Pagination page={1} perPage={10} total={20} onChange={change} />);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('请输入 1～2 之间的整数页码');
    expect(change).not.toHaveBeenCalled();
    rerender(<Pagination page={2} perPage={10} total={20} onChange={change} />);
    expect(screen.getByRole('textbox', { name: '跳转页码' })).toHaveValue('2');
  });
  it('翻页再返回不会恢复之前未提交的无效草稿', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<Pagination page={1} perPage={10} total={56} onChange={change} />);
    const input = screen.getByRole('textbox', { name: '跳转页码' });
    await user.clear(input);
    await user.type(input, '99{Enter}');
    rerender(<Pagination page={2} perPage={10} total={56} onChange={change} />);
    rerender(<Pagination page={1} perPage={10} total={56} onChange={change} />);
    expect(screen.getByRole('textbox', { name: '跳转页码' })).toHaveValue('1');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
