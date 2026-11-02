import React, { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Sun, Moon } from 'lucide-react';
import { PageHeader, PageContent, StatusIndicator } from '../../components';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useAppearance, PRESETS } from '../../design-system/appearance';
import { PageLayout } from '../../design-system/layouts';
import config from '../../config';
import { AlarmFeed } from './Monitoring';
import { WorkspaceTools } from './Workspace';
import PageGallery from './PageGallery';
import { pageRegistry } from './gallery/page-registry';
import usePreview from './preview/usePreview';
import PreviewDrawer from './preview/PreviewDrawer';
const ComponentGallery = lazy(() => import('./ComponentGallery'));

function TokenStrip() {
  const { preset, resolvedMode } = useAppearance();
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
      <div className="flex flex-wrap items-center gap-4">
        {[
          ['background', '背景'],
          ['card', '表面'],
          ['primary', '品牌'],
          ['foreground', '文本']
        ].map(([token, label]) => (
          <span key={token} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-4 rounded-full border" style={{ backgroundColor: `var(--${token})` }} />
            {label}
          </span>
        ))}
      </div>
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        {resolvedMode === 'dark' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
        {PRESETS.find(item => item.id === preset).name} / {resolvedMode}
      </span>
    </div>
  );
}
export default function DesignPlayground() {
  const preview = usePreview();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view');
  const tab = view === 'components' || pageRegistry.some(entry => entry.id === view) ? view : pageRegistry[0].id;
  const templateId = useId();
  const lastTemplate = useRef(tab === 'components' ? pageRegistry[0].id : tab);
  const selectedTemplate = pageRegistry.find(entry => entry.id === tab) || pageRegistry[0];
  const requestedTab = useRef(tab);
  useEffect(() => {
    requestedTab.current = tab;
    if (tab !== 'components') lastTemplate.current = tab;
  }, [tab]);
  const setTab = value => {
    // 聚焦与鼠标激活可能连续触发，避免同一次切换重复写入历史记录。
    if (requestedTab.current === value) return;
    requestedTab.current = value;
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      next.set('view', value);
      return next;
    });
  };
  const [guide, setGuide] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  return (
    <PageLayout tools={<WorkspaceTools />} alerts={<AlarmFeed />}>
      <Helmet title={`Design Playground - ${config.app.title}`} />
      <div className="min-w-0">
        <PageHeader
          breadcrumb={[{ name: '首页', link: '/' }, { name: '设计系统' }]}
          title="Design Playground"
          info="本地设计预览工具 · 手动调整或通过编辑器修改源码，实时查看真实组件效果。"
          actions={
            <>
              <PreviewDrawer open={configOpen} onOpenChange={setConfigOpen} preview={preview}>
                <TokenStrip />
                <div className="flex flex-wrap gap-2" aria-label="状态语义预览">
                  {[
                    ['success', '成功'],
                    ['warning', '告警'],
                    ['error', '故障'],
                    ['info', '信息'],
                    ['neutral', '离线']
                  ].map(([tone, label]) => (
                    <StatusIndicator key={tone} tone={tone} label={label} />
                  ))}
                </div>
              </PreviewDrawer>
              <Button variant="outline" size="sm" onClick={() => setGuide(true)}>
                <BookOpen />
                接入规范
              </Button>
            </>
          }
        />
        <PageContent>
          <div className="mx-auto max-w-[100rem] space-y-[var(--layout-gap)]">
            <Tabs value={tab === 'components' ? 'components' : 'pages'} onValueChange={value => setTab(value === 'components' ? 'components' : lastTemplate.current)} className="min-w-0 gap-5">
              <TabsList className="h-auto max-w-full justify-start gap-1 bg-muted/70 p-1" aria-label="设计示例">
                <TabsTrigger value="pages">页面模板</TabsTrigger>
                <TabsTrigger value="components">组件库</TabsTrigger>
              </TabsList>
              <TabsContent value="pages" className="min-w-0 space-y-[var(--layout-gap)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Label htmlFor={templateId} className="shrink-0">
                    选择页面模板
                  </Label>
                  <Select value={selectedTemplate.id} onValueChange={setTab}>
                    <SelectTrigger id={templateId} className="w-full sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageRegistry.map(entry => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <PageGallery key={selectedTemplate.id} entry={selectedTemplate} />
              </TabsContent>
              <TabsContent value="components">
                <Suspense
                  fallback={
                    <p role="status" className="py-8 text-sm text-muted-foreground">
                      加载组件示例…
                    </p>
                  }
                >
                  <ComponentGallery />
                </Suspense>
              </TabsContent>
            </Tabs>
            <footer className="border-t py-4 text-xs leading-relaxed text-muted-foreground">调整即时预览，点击“保存到项目”后写入源码；直接修改源码也会自动更新预览。</footer>
          </div>
        </PageContent>
      </div>
      <Dialog open={guide} onOpenChange={setGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设计系统接入规范</DialogTitle>
            <DialogDescription>规范入口：AGENTS.md；设计、画廊注册与 AI 协作说明位于 docs/。</DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>先选择页面结构，再独立选择设计预设、颜色模式与密度。</li>
            <li>优先使用语义 Token、官方 shadcn/ui 和通用业务组件。</li>
            <li>不要在页面重新定义颜色，也不要把状态色绑定到品牌色。</li>
            <li>使用 AppearanceProvider，避免创建第二套主题状态。</li>
            <li>新增公共组件注册 Component Gallery，通用页面模板注册 Page Gallery。</li>
            <li>根据用户需求选择图片设计、原型、图片转代码或直接开发，不要求固定顺序。</li>
            <li>完成后验证浅深色、键盘交互与 390 / 1024 / 1440px 布局。</li>
          </ol>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
