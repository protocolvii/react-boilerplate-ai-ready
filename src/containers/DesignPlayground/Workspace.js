import React, { useState } from 'react';
import { Sparkles, FileText, ListChecks, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusIndicator } from '../../components';
const tools = [
  { label: '分析助手', icon: Sparkles },
  { label: '知识检索', icon: BookOpen },
  { label: '任务规划', icon: ListChecks }
];
export function WorkspaceTools() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold">工作区资源</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">为当前任务组织资料、上下文与输出。</p>
      </div>
      <div className="rounded-lg border p-3">
        <FileText className="mb-2 size-4 text-primary" />
        <p className="text-sm font-medium">设备运行周报</p>
        <p className="mt-1 text-xs text-muted-foreground">设计演示资料 · 2 个文档</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">任务状态</p>
        <StatusIndicator tone="info" label="本地设计演示" />
        <p className="text-xs leading-relaxed text-muted-foreground">当前示例没有调用 AI 服务，内容用于验证工作台布局。</p>
      </div>
    </div>
  );
}
export default function Workspace({ showResources = true }) {
  const [active, setActive] = useState('分析助手');
  return (
    <section className="ds-panel overflow-hidden" aria-label="AI 工作台示例">
      <div className="ds-brand-band" />
      <div className="flex flex-col xl:flex-row">
        <nav aria-label="AI 工具" className="flex shrink-0 flex-wrap gap-1 border-b bg-muted/30 p-3 xl:w-40 xl:flex-col xl:border-b-0 xl:border-r">
          {tools.map(({ label, icon: Icon }) => (
            <Button key={label} variant={active === label ? 'secondary' : 'ghost'} onClick={() => setActive(label)} className="justify-start">
              <Icon className="size-4" />
              {label}
            </Button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <header className="flex items-center gap-3 border-b p-[var(--panel-space)]">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">{active}</h2>
              <p className="mt-1 text-xs text-muted-foreground">将上下文转化为可执行的工作成果</p>
            </div>
          </header>
          <div className="space-y-5 p-[var(--panel-space)]">
            <div className="rounded-lg bg-muted p-4 text-sm leading-7">请整理本周设备运行状况，关注告警与离线设备，并生成一份检查清单。</div>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" />
                已整理本次演示中的关键事项
              </p>
              <p className="text-sm leading-7 text-muted-foreground">大部分设备运行平稳。建议优先复核废气处理站的浓度告警，再检查包装车间采集设备的网络连接。</p>
              <div className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">建议执行清单</h3>
                  <StatusIndicator tone="success" label="已生成示例" />
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>01 / 复核 VOC-003 的采样与处理记录</li>
                  <li>02 / 检查 VOC-005 的网络与供电</li>
                  <li>03 / 将检查结果归档到运行周报</li>
                </ul>
              </div>
            </div>
            <p className="border-t pt-4 text-xs text-muted-foreground">静态工作台布局预览，不提供 AI 对话或任务服务。</p>
          </div>
        </div>
        {showResources && (
          <aside className="border-t p-[var(--panel-space)] xl:w-56 xl:shrink-0 xl:border-l xl:border-t-0">
            <WorkspaceTools />
          </aside>
        )}
      </div>
    </section>
  );
}
