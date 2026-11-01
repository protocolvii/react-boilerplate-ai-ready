import React from 'react';
import { cn } from '../../utils/cn';
export default function MetricCard({ label, value, detail, icon: Icon, className }) {
  return (
    <div className={cn('ds-panel min-w-0 p-[var(--panel-space)]', className)}>
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{label}</span>
        {Icon && <Icon aria-hidden="true" className="size-4" />}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums" data-metric-value>
        {value}
      </div>
      {detail && <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</div>}
    </div>
  );
}
