import React from 'react';
import { Progress } from '../ui/progress';
import { cn } from '../../utils/cn';

// value 为 0–100；null 表示尚无法确定进度。
export default function ProgressBar({ value = 0, label, showValue = true, className }) {
  const progress = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Progress value={progress} aria-label={label} aria-valuetext={progress === null ? '处理中' : undefined} className={cn('h-1.5 min-w-0 flex-1 bg-muted', progress === null && 'motion-safe:[&_[data-slot=progress-indicator]]:animate-pulse')} />
      {showValue && (
        <span aria-hidden="true" className="shrink-0 text-sm tabular-nums">
          {progress === null ? '处理中' : `${progress}%`}
        </span>
      )}
    </div>
  );
}
