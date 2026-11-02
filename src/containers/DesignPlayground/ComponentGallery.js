import React, { Suspense, useId, useState } from 'react';
import { SectionHeader, EmptyState } from '../../components';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { componentRegistry } from './gallery/component-registry';
import { filterRegistry } from './gallery/registry-utils';

const categoryLabels = { Basic: '基础组件', Form: '表单组件', Feedback: '反馈组件', Business: '业务组件' };

export default function ComponentGallery() {
  const id = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const entries = filterRegistry(componentRegistry, query, category);
  return (
    <div className="space-y-[var(--layout-gap)]">
      <SectionHeader title="Component Gallery" description="基础 UI 与公共业务组件的真实示例；新增可复用组件时同步注册。" />
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={`${id}-search`}>搜索组件</Label>
          <Input id={`${id}-search`} value={query} onChange={event => setQuery(event.target.value)} placeholder="名称、组件名或标签" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-category`}>组件分类</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id={`${id}-category`} className="w-36 max-w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {[...new Set(componentRegistry.map(entry => entry.category))].map(value => (
                <SelectItem key={value} value={value}>
                  {categoryLabels[value] || value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {!entries.length && <EmptyState title="没有匹配的组件" description="尝试其他组件名或分类。" />}
      <div className="grid items-start gap-[var(--layout-gap)] xl:grid-cols-2">
        {entries.map(({ id: entryId, name, description, category: entryCategory, preview: Preview }) => (
          <section key={entryId} data-component-id={entryId} className="ds-panel min-w-0 space-y-5 p-[var(--panel-space)]" aria-label={name}>
            <SectionHeader title={name} description={description} />
            <p className="text-xs text-muted-foreground">{categoryLabels[entryCategory] || entryCategory}</p>
            <Suspense
              fallback={
                <p role="status" className="text-sm text-muted-foreground">
                  加载组件示例…
                </p>
              }
            >
              <Preview />
            </Suspense>
          </section>
        ))}
      </div>
    </div>
  );
}
