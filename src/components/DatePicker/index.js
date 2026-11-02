import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../utils/cn';

// value / min / max 使用本地日期 YYYY-MM-DD；onChange 接收日期字符串，清空时为 ''。
export default function DatePicker({ value, defaultValue = '', onChange, min, max, name, disabled, placeholder = '请选择日期', className, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const current = value === undefined ? internalValue : value;
  const parsed = current ? parseISO(current) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  const choose = date => {
    const next = date ? format(date, 'yyyy-MM-dd') : '';
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  };
  const limits = [];
  if (min) limits.push({ before: parseISO(min) });
  if (max) limits.push({ after: parseISO(max) });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={current || ''} disabled={disabled} />}
      <PopoverTrigger asChild>
        <Button {...props} type="button" variant="outline" disabled={disabled} className={cn('w-full min-w-0 justify-between font-normal', !selected && 'text-muted-foreground', className)}>
          <span>{selected ? format(selected, 'yyyy-MM-dd') : placeholder}</span>
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[var(--radix-popover-content-available-height)] w-auto max-w-[calc(100vw-2rem)] overflow-y-auto p-0">
        <Calendar mode="single" locale={zhCN} selected={selected} defaultMonth={selected || (min ? parseISO(min) : undefined)} onSelect={choose} disabled={limits} captionLayout="dropdown" />
        <div className="flex justify-end border-t p-2">
          <Button type="button" variant="ghost" size="sm" disabled={!current} onClick={() => choose(undefined)}>
            清空日期
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
