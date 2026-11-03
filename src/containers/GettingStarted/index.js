import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, BookOpen, Copy, Layers, Palette, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MainHeader, MainMenu, PageHeader, PageContent, MainPage, PageSection, SectionHeader } from '../../components';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import config from '../../config';

const promptExamples = [
  { title: '创建一个功能', prompt: '先阅读项目的 AGENTS.md。帮我做一个设备管理功能，可以搜索、新增、编辑和删除设备，风格和当前系统一致。暂时没有后端，先用模拟数据让我试用。' },
  { title: '调整页面样式', prompt: '帮我把当前页面调整得更简洁一些，表格紧凑一点，手机上也方便操作。沿用项目的设计规范，先给我预览效果。' },
  { title: '检查使用效果', prompt: '帮我用浏览器检查刚做好的页面，试一下搜索、保存和错误提示，再看看手机上是否正常，有问题就修好。' },
  { title: '配置 AI 的组件工具', prompt: '请参考 shadcn/ui 官方文档，为我当前使用的 AI Agent 安装并配置官方 Skill 和 MCP，保留已有配置，完成后验证能否查询组件。不支持的部分请告诉我替代方法。' }
];

const copyPrompt = async prompt => {
  try {
    await navigator.clipboard.writeText(prompt);
    toast.success('提示词已复制');
  } catch {
    toast.error('复制失败，请手动选择并复制提示词');
  }
};

const GettingStarted = () => (
  <div className="flex min-h-screen flex-col bg-muted/40">
    <Helmet title={config.app.title} />
    <MainHeader />
    <MainMenu />
    <MainPage fill>
      <PageHeader breadcrumb={[{ name: '首页', link: '/' }, { name: '使用向导' }]} title="使用向导" info="从外观配置到业务开发，开始搭建你的项目。" />
      <PageContent fill>
        <PageSection fill>
          <div className="grid min-w-0 items-start gap-[var(--layout-gap)] xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-7">
              <SectionHeader title="开始使用" description="在编辑器中与 AI Agent 协作，预览效果、确认需求，再逐步完善业务。" />

              {import.meta.env.DEV && (
                <section aria-labelledby="home-design-title" className="space-y-3 rounded-lg border bg-muted/20 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Palette className="size-4 text-primary" aria-hidden="true" />
                    <h3 id="home-design-title" className="text-sm font-semibold">
                      先确定项目外观
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">点击右上角开发工具菜单中的“设计系统”，或从这里打开。通过页面模板和组件库查看效果，在设计配置中调整主题、浅深色、颜色、字体与信息密度。</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">调整先用于预览；确认后点击“保存到项目”写入源码。设计系统入口仅在本地开发环境显示。</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/design-playground">
                      打开设计系统
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </Button>
                </section>
              )}

              <section aria-labelledby="home-agent-title" className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" aria-hidden="true" />
                  <h3 id="home-agent-title" className="text-sm font-semibold">
                    像描述需求一样，和 AI 一起开发
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">在你使用的 AI 编辑器中打开项目，先告诉 AI：“阅读 AGENTS.md，按照项目规范帮我开发。”之后直接说你想要什么，不需要知道技术名词；细节可以边看效果边补充。</p>
                <p className="text-sm leading-relaxed text-muted-foreground">项目自带的 Skills 就像开发步骤说明，帮助 AI 按统一方式创建页面和组件。让 AI 按任务使用即可；无法自动识别时，也可以让它读取项目的 .agents/skills 目录。</p>
              </section>

              <section aria-labelledby="home-example-title" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" aria-hidden="true" />
                  <h3 id="home-example-title" className="text-sm font-semibold">
                    试着这样告诉 AI
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">选一个示例复制过去，把“设备”或页面要求换成你的需求就可以。</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {promptExamples.map(({ title, prompt }) => (
                    <article key={title} aria-label={title} className="flex min-w-0 flex-col gap-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium">{title}</h4>
                        <Button variant="ghost" size="sm" aria-label={`复制提示词：${title}`} onClick={() => copyPrompt(prompt)}>
                          <Copy aria-hidden="true" />
                          复制
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{prompt}</p>
                    </article>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">官方 Skill 和 MCP 能帮助 AI 更方便地找到和使用组件，属于可选增强。未安装也可以正常开发；是否支持、如何安装，由 AI 根据你使用的工具和官方文档检查。</p>
              </section>
            </div>

            <aside aria-labelledby="home-intro-title" className="min-w-0 space-y-5 rounded-lg border bg-muted/20 p-4 sm:p-5">
              <SectionHeader id="home-intro-title" title="项目简介" description="面向 AI 协作开发的 React 管理后台脚手架，用统一的设计与工程规范承接业务需求。" />
              <a href="https://github.com/ihahoo/react-boilerplate-ai-ready" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
                项目 GitHub 仓库
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'Vite', 'shadcn/ui', 'Tailwind CSS'].map(name => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
              </div>
              <dl className="space-y-4 text-sm leading-relaxed">
                <div>
                  <dt className="font-medium">shadcn/ui · 现成的界面组件</dt>
                  <dd className="mt-1 text-muted-foreground">按钮、日期选择、弹窗等不用从头做，源码就在项目中，AI 可以复用并按需求调整，保持界面一致。</dd>
                </div>
                <div>
                  <dt className="font-medium">Tailwind CSS · 统一的样式工具</dt>
                  <dd className="mt-1 text-muted-foreground">帮助 AI 调整布局、间距和手机适配，配合设计系统统一颜色与外观。</dd>
                </div>
                <div>
                  <dt className="font-medium">表单与消息反馈</dt>
                  <dd className="mt-1 text-muted-foreground">React Hook Form + Zod 负责表单校验，Sonner 展示保存结果，让错误和成功提示更清楚。你只需描述填写规则。</dd>
                </div>
                <div>
                  <dt className="font-medium">模拟数据与自动检查</dt>
                  <dd className="mt-1 text-muted-foreground">Mock 让页面在没有后端时也能试用；Vitest 和 Playwright 帮助 AI 检查逻辑与浏览器操作。</dd>
                </div>
              </dl>
              <div className="space-y-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">shadcn/ui 官方入口</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    ['组件文档', 'https://ui.shadcn.com/docs'],
                    ['Skill 指南', 'https://ui.shadcn.com/docs/skills'],
                    ['MCP 指南', 'https://ui.shadcn.com/docs/mcp']
                  ].map(([label, href]) => (
                    <a key={href} href={href} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                      {label}
                    </a>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <BookOpen className="size-4" aria-hidden="true" />
                  常用开发入口
                </p>
                <p>项目说明：README.md</p>
                <p>开发规范：AGENTS.md</p>
                <p>业务接入：docs/development.md</p>
                <p>
                  本地无后端调试：<code className="break-all text-foreground">npm run dev:mock</code>
                </p>
                <p>修改密码请使用右上角账号菜单。</p>
              </div>
            </aside>
          </div>
        </PageSection>
      </PageContent>
    </MainPage>
  </div>
);

export default GettingStarted;
