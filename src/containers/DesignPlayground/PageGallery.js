import React, { Suspense } from 'react';

export default function PageGallery({ entry }) {
  const Preview = entry.preview;
  return (
    <section data-page-id={entry.id} aria-label={`${entry.name}页面模板`} className="min-w-0 space-y-[var(--layout-gap)]">
      <p className="text-xs text-muted-foreground">
        Page Gallery · {entry.category} · {entry.description}
      </p>
      <Suspense
        fallback={
          <p role="status" className="py-8 text-sm text-muted-foreground">
            加载页面示例…
          </p>
        }
      >
        <Preview />
      </Suspense>
    </section>
  );
}
