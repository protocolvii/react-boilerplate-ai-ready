import React, { useId, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination';
import ValidationPopover from '../ValidationPopover';
// 以当前页为 key 重建局部草稿，翻页后不会恢复此前未提交的输入。
function PageJump({ current, pages, onJump }) {
  const id = useId();
  const [value, setValue] = useState(String(current));
  const [attempted, setAttempted] = useState(0);
  const inputRef = useRef(null);
  const valid = /^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= pages;
  const error = attempted && !valid ? `请输入 1～${pages} 之间的整数页码` : '';
  return (
    <form
      noValidate
      className="flex items-center gap-2"
      onSubmit={event => {
        event.preventDefault();
        setAttempted(value => value + 1);
        if (valid) onJump(Number(value));
        else inputRef.current?.focus();
      }}
    >
      <Label htmlFor={id} className="font-normal">
        跳至
      </Label>
      <ValidationPopover message={error} attempt={attempted} errorId={`${id}-error`}>
        <Input ref={inputRef} id={id} aria-label="跳转页码" name="page" type="text" inputMode="numeric" value={value} onChange={event => setValue(event.target.value)} className="w-20" />
      </ValidationPopover>
      <Button variant="outline" type="submit">
        跳转
      </Button>
    </form>
  );
}

const Page = ({ page = 1, perPage = 10, total = 0, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const go = value => onChange(Math.min(pages, Math.max(1, value)), perPage);
  return (
    <div className="flex flex-wrap items-start justify-end gap-3 py-4 text-sm">
      <span className="flex h-[var(--control-height)] items-center">共 {total} 条数据</span>
      <label className="flex items-center gap-2">
        每页
        <select aria-label="每页条数" value={perPage} onChange={event => onChange(1, Number(event.target.value))} className="h-9 rounded-md border bg-background px-2">
          {[...new Set([10, 20, 50, 100, perPage])]
            .sort((a, b) => a - b)
            .map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
        </select>
      </label>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <Button variant="outline" disabled={current <= 1} onClick={() => go(current - 1)}>
              上一页
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span aria-live="polite">
              {current} / {pages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button variant="outline" disabled={current >= pages} onClick={() => go(current + 1)}>
              下一页
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <PageJump key={current} current={current} pages={pages} onJump={go} />
    </div>
  );
};
export default Page;
