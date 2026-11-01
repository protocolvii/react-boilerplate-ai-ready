import React from 'react';
import { Inbox } from 'lucide-react';
export default function EmptyState({ title = '暂无数据', description = '调整筛选条件后重试。', actions }) {
  return (
    <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <div className="rounded-xl bg-muted p-3">
        <Inbox aria-hidden="true" className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {actions}
    </div>
  );
}
