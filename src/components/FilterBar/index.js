import React from 'react';
export default function FilterBar({ children, summary }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="筛选条件">
        {children}
      </div>
      {summary && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {summary}
        </p>
      )}
    </div>
  );
}
