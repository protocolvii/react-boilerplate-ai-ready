import React, { lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { RotateCcw, BookOpen, Layers3, Sun, Moon } from 'lucide-react';
import { PageHeader, PageContent, SectionHeader, StatusIndicator } from '../../components';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { AppearanceControls } from '../../design-system/components';
import { useAppearance, PRESETS } from '../../design-system/appearance';
import { PageLayout, useLayout } from '../../design-system/layouts';
import config from '../../config';
import DataManagement from './DataManagement';
import Monitoring, { AlarmFeed } from './Monitoring';
import Workspace, { WorkspaceTools } from './Workspace';
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
  const appearance = useAppearance();
  const { layout, setLayout } = useLayout();
  const [tab, setTab] = useState('data');
  const [guide, setGuide] = useState(false);
  return (
    <PageLayout tools={<WorkspaceTools />} alerts={<AlarmFeed />}>
      <Helmet title={`Design Playground - ${config.app.title}`} />
      <PageHeader
        breadcrumb={[{ name: '首页', link: '/' }, { name: '设计系统' }]}
        title="Design Playground"
        info="以统一的视觉语言，构建不同场景的工作界面。"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                appearance.resetAppearance();
                setLayout('standard-admin');
              }}
            >
              <RotateCcw />
              重置外观
            </Button>
            <Button variant="outline" size="sm" onClick={() => setGuide(true)}>
              <BookOpen />
              接入规范
            </Button>
          </>
        }
      />
      <PageContent>
        <div className="mx-auto max-w-[100rem] space-y-[var(--layout-gap)]">
          <section className="ds-panel space-y-5 p-[var(--panel-space)]" aria-label="主题控制面板">
            <SectionHeader
              title="外观配置"
              description="预设、颜色模式、信息密度与页面布局互相独立。"
              actions={
                <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  <Layers3 className="size-3.5" />
                  Design System · 1.0
                </span>
              }
            />
            <AppearanceControls />
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
          </section>
          <Tabs value={tab} onValueChange={setTab} className="min-w-0 gap-5">
            <TabsList className="h-auto max-w-full justify-start gap-1 overflow-x-auto bg-muted/70 p-1" aria-label="设计示例">
              <TabsTrigger value="data">数据管理</TabsTrigger>
              <TabsTrigger value="monitoring">工业监测</TabsTrigger>
              <TabsTrigger value="workspace">AI 工作台</TabsTrigger>
              <TabsTrigger value="components">基础组件</TabsTrigger>
            </TabsList>
            <TabsContent value="data">
              <DataManagement />
            </TabsContent>
            <TabsContent value="monitoring">
              <Monitoring showFeed={layout !== 'monitoring'} />
            </TabsContent>
            <TabsContent value="workspace">
              <Workspace showResources={layout !== 'workspace'} />
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
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t py-4 text-xs text-muted-foreground">
            <span>Design Playground / 静态演示，不调用业务接口</span>
            <StatusIndicator tone="neutral" label="主题不改变业务行为" />
          </footer>
        </div>
      </PageContent>
      <Dialog open={guide} onOpenChange={setGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设计系统接入规范</DialogTitle>
            <DialogDescription>完整文档位于项目 docs/design-system.md。</DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>先选择页面结构，再独立选择设计预设、颜色模式与密度。</li>
            <li>优先使用语义 Token、官方 shadcn/ui 和通用业务组件。</li>
            <li>不要在页面重新定义颜色，也不要把状态色绑定到品牌色。</li>
            <li>使用 AppearanceProvider，避免创建第二套主题状态。</li>
            <li>完成后验证浅深色、键盘交互与 390 / 1024 / 1440px 布局。</li>
          </ol>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
