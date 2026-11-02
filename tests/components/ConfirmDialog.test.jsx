import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '@/components/ConfirmDialog';

function ConfirmExample({ onConfirm }) {
  const [open, setOpen] = useState(true);
  return <ConfirmDialog open={open} onOpenChange={setOpen} title="删除记录？" description="此操作会删除当前记录。" onConfirm={onConfirm} />;
}

describe('ConfirmDialog', () => {
  it('取消直接关闭，不执行提交', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    render(<ConfirmExample onConfirm={confirm} />);
    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });
  it('异步执行期间禁用确认和取消，成功后关闭', async () => {
    const user = userEvent.setup();
    let complete;
    const pending = new Promise(resolve => {
      complete = resolve;
    });
    const confirm = vi.fn(() => pending);
    render(<ConfirmExample onConfirm={confirm} />);
    await user.click(screen.getByRole('button', { name: '确认' }));
    const processing = screen.getByRole('button', { name: '处理中…' });
    expect(processing).toBeDisabled();
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled();
    await user.click(processing);
    expect(confirm).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog', { name: '删除记录？' })).toBeInTheDocument();
    await act(async () => {
      complete();
      await pending;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
  it('失败保留对话框并显示错误，允许用户重试', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn().mockRejectedValueOnce(new Error('network error')).mockResolvedValueOnce(undefined);
    render(<ConfirmExample onConfirm={confirm} />);
    await user.click(screen.getByRole('button', { name: '确认' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('操作失败，请重试。');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: '确认' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
