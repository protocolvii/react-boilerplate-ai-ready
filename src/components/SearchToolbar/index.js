import React, { useId } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
export default function SearchToolbar({ value, onChange, onSubmit, children, placeholder = '搜索名称…', actions }) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <form
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
        onSubmit={event => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <div className="relative min-w-0 flex-1 sm:max-w-72">
          <Label htmlFor={id} className="sr-only">
            搜索项目
          </Label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="pl-9" />
        </div>
        <Button type="submit" variant="outline">
          搜索
        </Button>
        {children}
      </form>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
