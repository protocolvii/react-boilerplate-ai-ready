import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Pagination, PaginationContent, PaginationItem } from '../ui/pagination';
const Page = ({ page = 1, perPage = 10, total = 0, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const go = value => onChange(Math.min(pages, Math.max(1, value)), perPage);
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 py-4 text-sm">
      <span>共 {total} 条数据</span>
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
      <form
        className="flex items-center gap-2"
        onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          go(Number(data.get('page')));
        }}
      >
        <Label>
          跳至
          <Input aria-label="跳转页码" name="page" type="number" min={1} max={pages} defaultValue={current} key={current} required className="w-20" />
        </Label>
        <Button variant="outline" type="submit">
          跳转
        </Button>
      </form>
    </div>
  );
};
export default Page;
