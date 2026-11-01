import React from 'react';
import { CircleCheck, AlertTriangle, CircleX, Info, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';
const icons = { success: CircleCheck, warning: AlertTriangle, error: CircleX, info: Info, neutral: Circle };
export default function StatusIndicator({ tone = 'neutral', label, className }) {
  const safeTone = Object.hasOwn(icons, tone) ? tone : 'neutral';
  const Icon = icons[safeTone];
  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium', className)} style={{ color: `var(--status-${safeTone}-foreground)`, backgroundColor: `var(--status-${safeTone}-background)` }}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span>{label || safeTone}</span>
    </span>
  );
}
