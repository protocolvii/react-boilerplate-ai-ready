# Design System

本系统面向长期复用的管理后台。业务页面共享语义 Token、shadcn/ui 基础组件和业务组件；主题、颜色模式、密度与布局分别选择。设计预览入口为本地开发服务的 `/design-playground`，无需登录，使用页面内静态数据，不访问业务 API。

## AI 开发入口

1. 阅读本文与 AGENTS.md，再检查实际组件源码。
2. 默认使用 Modern SaaS、跟随系统颜色、Default 密度和 Standard Admin 布局。
3. 新页面优先组合已有组件，不复制一套基础组件，不按主题写三套 JSX。
4. 使用语义颜色，不把品牌蓝、紫色或状态颜色硬编码到业务页面。
5. 外观状态通过 Provider 更新，不在页面直接修改根 class、data 属性或 localStorage。
6. 页面仍使用 JavaScript；业务文件 `.js`，shadcn CLI 文件 `.jsx`。
7. Playground 的数据与交互仅供演示。业务接口继续走 request、鉴权及既有 Redux 流程。

## 预设与独立维度

| 预设           | 定位                | 主要差异                                         |
| -------------- | ------------------- | ------------------------------------------------ |
| Modern SaaS    | 日常业务与数据管理  | 克制蓝色、中等圆角、轻阴影、清晰层级             |
| Industrial Pro | 设备与运维监测      | 蓝青色、小圆角、低阴影、等宽指标、紧致节奏       |
| Creative AI    | AI 工作区与创作工具 | 紫色、较大圆角、柔和阴影、宽松节奏、局部品牌渐变 |

每个预设均定义 Light / Dark。System 根据操作系统偏好实时选择颜色模式。预设不会强制更改用户密度或布局；例如 Creative AI 也能使用 Compact 和 Monitoring。

- 密度：`default`、`comfortable`、`compact`。
- 布局：`standard-admin`、`workspace`、`monitoring`。
- 外观持久化键：`react-boilerplate:appearance:v1`。
- 布局持久化键：`react-boilerplate:layout:v1`。
- 存储不可用时使用默认值；无效字段归一化。外观支持跨标签页同步。

## 文件结构

```text
src/design-system/
  appearance/settings.js     预设注册、默认值、校验、首屏脚本生成
  appearance/context.js      useAppearance
  appearance/index.js        AppearanceProvider、系统偏好监听与持久化
  layouts/context.js         布局注册与 useLayout
  layouts/provider.js        布局选择、移动端导航状态
  layouts/index.js           三种布局与动态 PageLayout
  components/index.js        AppearanceControls
  tokens/base.css            字体、状态色、密度基础值、动效
  tokens/modern-saas.css      SaaS 的浅深色语义变量
  tokens/industrial-pro.css   工业预设的浅深色语义变量
  tokens/creative-ai.css      AI 预设的浅深色语义变量
  tokens/density.css          密度与响应式布局适配
src/assets/css/main.css       全局导入、Tailwind @theme 映射和基础元素
src/containers/DesignPlayground/  组件画廊与三个业务示例
```

Token 目录和 main.css 是全局 CSS，其余业务 `.css` 仍默认使用 CSS Modules。不要在 Token 文件使用局部类名导出。

## Token 分层

主题文件把原始颜色映射到语义变量；Tailwind 的 `@theme inline` 将这些变量映射为工具类；组件消费语义工具类或 CSS 变量。业务层不直接依赖预设名称。

| 类别 | 变量 / 工具类示例                                                 | 用途                                   |
| ---- | ----------------------------------------------------------------- | -------------------------------------- |
| 页面 | `background` / `foreground`                                       | 页面底色和主要文字                     |
| 容器 | `card` / `card-foreground`、`popover` / `popover-foreground`      | 面板、浮层                             |
| 品牌 | `primary` / `primary-foreground`                                  | 主要操作与品牌强调                     |
| 次级 | `secondary`、`muted`、`accent` 及对应 foreground                  | 次操作、低层级区域、交互高亮           |
| 边界 | `border`、`input`、`ring`                                         | 分隔、输入边框、焦点                   |
| 危险 | `destructive` / `destructive-foreground`                          | 删除与不可逆操作                       |
| 侧栏 | `sidebar-*`                                                       | 侧栏背景、文字、选中态与边界           |
| 图表 | `chart-1` … `chart-5`                                             | 序列颜色，不代表业务状态               |
| 状态 | `status-success/warning/error/info/neutral` 及 `*-foreground`     | 稳定状态语义                           |
| 排版 | `font-sans`、`font-data`、heading 相关变量                        | Inter 可变字体与系统中文回退、等宽数据 |
| 形态 | `radius`、`border-width`、`shadow-*`、`panel-shadow`              | 圆角、边框与阴影                       |
| 节奏 | `control-height`、`table-cell-space`、`panel-space`、`layout-gap` | 控件、表格与布局密度                   |
| 动效 | `motion-duration`、`motion-easing`                                | 交互过渡，尊重 reduced motion          |

优先写 `bg-background text-foreground`、`bg-card text-card-foreground`、`text-muted-foreground`、`border-border`。状态使用 StatusIndicator，不用品牌 primary 表示成功。图表同时提供标签、单位和图例；告警使用图标与文字，不仅靠颜色区分。

## AppearanceProvider

Root 已挂载 Provider。模板插件在 head 注入与 Provider 共用的初始化脚本，CSS 与 React 加载前设置 `data-theme`、`data-density`、`data-color-mode`、`.dark` 和 `color-scheme`，避免深色首屏闪白。新增预设不要另写一份首屏逻辑。

```js
import { useAppearance } from '@/design-system/appearance/context';

const { preset, colorMode, density, resolvedMode, updateAppearance, resetAppearance } = useAppearance();
updateAppearance({ preset: 'industrial-pro' });
updateAppearance({ colorMode: 'system', density: 'compact' });
```

`resolvedMode` 是实际 light/dark，`colorMode` 可以是 system。全局 Sonner 使用实际模式。主题切换更新变量，不重新挂载业务页面，搜索、表单与弹窗状态应保留。

新增预设：在 settings.js 注册 ID，创建包含完整浅深色语义变量的 CSS，导入 main.css，检查正文、按钮、弱文字与状态文字的对比度，扩展六主题验证。不要遗漏 sidebar、chart、status、输入、焦点和浮层。

## 布局

Root 已挂载 LayoutProvider。业务页面通常使用固定布局，只有允许用户选择布局的页面使用 PageLayout。

```jsx
import { StandardAdminLayout } from '@/design-system/layouts';
import { PageHeader, PageContent } from '@/components';

<StandardAdminLayout>
  <PageHeader title="项目管理" info="管理团队项目" actions={<Button>新建项目</Button>} />
  <PageContent>{/* 业务内容 */}</PageContent>
</StandardAdminLayout>;
```

- StandardAdminLayout：顶部导航、可收起侧栏和主内容。
- WorkspaceLayout：接受 `tools`，提供可收起的右侧工具面板。
- MonitoringLayout：接受 `alerts`，提供右侧实时信息面板。
- PageLayout：相同 props，根据 `useLayout().layout` 动态选择样式，保持子页面树稳定。

布局自身包含 MainHeader / MainMenu / MainPage，不要再重复挂载。顶部栏仅在开发环境显示直达设计系统的图标，所有外观调整集中在 Playground，最终用户没有样式或颜色模式选择入口；桌面侧栏可折叠，移动端使用 Sheet。小于 1280px 时右侧面板移至正文下方，小于 768px 时启用移动导航。宽表格在表格容器内横向滚动，不让整个页面溢出。

## 侧栏子导航

菜单配置位于 `src/components/MainMenu/items.js`，由 Navigation.js 递归渲染，桌面和移动端共用。分组设置稳定的 key 与 children，叶节点设置 to：

```js
{ key: 'users', label: '用户管理', icon: Users, children: [
  { to: '/users', label: '用户列表' },
  { to: '/user-groups', label: '用户组' }
] }
```

分组不负责跳转，点击可展开或收起；进入叶节点路由时自动展开祖先并高亮选中项。叶节点默认精确匹配，`end: false` 允许匹配详情子路由。侧栏收起时点击分组图标显示浮层，更深层级使用子浮层；移动端在抽屉内缩进展开。使用原生按钮、嵌套列表和 aria-expanded / aria-current 提供键盘和选中语义。

侧栏不放置设计系统入口，业务菜单的递归 children、自动展开、选中和折叠浮层能力仍保留。Playground 自身的 Tabs 使用 `?view=data|monitoring|workspace|components` 与浏览器历史同步。业务页面通常直接使用独立路由，菜单不替代路由注册与登录保护；查询参数匹配可通过 defaultSearch 指定缺省查询值。

## 密度

密度通过根属性切换 Token，再由 data-slot 适配官方组件，无需复制三份组件源码。Default 控件基准 36px，Comfortable 为 44px，Compact 为 32px；表格单元格、面板内边距、布局间距和 textarea 同步变化。预设的 spacing scale 在这些值上施加视觉节奏差异。

显式 `size="sm"`、图标尺寸保留自身语义；触摸设备上按钮与输入的最小高度为 44px。新增控件尽量复用基础组件；新增容器使用 `--panel-space`、`--layout-gap`，不要只缩小字体来模拟紧凑模式。

## 组件分层与 API

基础组件位于 `src/components/ui/`，遵循官方 API，优先使用 variant、size、asChild 等组合方式。高级业务组件从 `@/components` 导入：

| 组件            | 主要 props                                                                      |
| --------------- | ------------------------------------------------------------------------------- |
| PageHeader      | title、info、breadcrumb、actions、children                                      |
| SectionHeader   | title、description、actions、id                                                 |
| MetricCard      | label、value、detail、icon、className                                           |
| StatusIndicator | tone、label、className                                                          |
| EmptyState      | title、description、actions                                                     |
| SearchToolbar   | value、onChange、onSubmit、placeholder、actions、children                       |
| FilterBar       | summary、children                                                               |
| DataTable       | columns、rows、rowKey、sort、onSort、loading、caption、emptyTitle、emptyActions |
| ConfirmDialog   | open、onOpenChange、title、description、confirmLabel、onConfirm                 |

DataTable 列定义为 `{ key, header, sortable, render }`，render 接收整行数据；排序和分页由页面控制。它不是完整表格引擎，不隐式请求接口。ConfirmDialog 等待 onConfirm 的 Promise，处理中禁用重复操作，失败保留对话框并显示错误。

业务失败、权限、加载状态依实际接口处理，不能直接沿用静态示例的成功行为。对话框需标题、描述；图标按钮需 aria-label；表单需 Label 和错误关联；通知在事件或 effect 中触发。

## Playground

`/design-playground` 提供四个页签：

- 数据管理：搜索、状态过滤、排序、分页、编辑/新增 Dialog、归档确认和空状态。
- 工业监测：指标、带单位与阈值的 SVG 趋势图、设备表格、告警时间线，刷新为本地示例数据。
- AI 工作台：静态项目资源、结果卡片、工作区导航和上下文面板，不提供 AI 对话或任务发送。
- 基础组件：按钮、表单控件、Select、Checkbox、Radio、Switch、Dialog、Sheet、Popover、Tooltip、Tabs、Badge、Alert、Skeleton、Card、Separator。

示例数据在 data.js 中固定，便于截图比较，演示业务数据不持久化。Playground 是本地预览工具，不连接 AI，不提供对话能力。使用 VS Code 中的 Codex 或其他 Agent 编辑代码，由 Vite 热更新页面。

### 手动实时调整

点击页面标题旁或右下角的“设计配置”打开面板。配置分为“外观配置”和“样式微调”两个页签，面板独立滚动，预览页面不再被配置表单向下挤占。右侧面板覆盖在页面上方，不改变预览区域宽度或触发布局重排；宽屏下可操作未被遮挡的预览区域，平板和手机使用抽屉。关闭面板即可查看完整效果。点击面板外的预览区域、隐藏按钮或按 Escape 可关闭，当前调整与撤销历史保留；右下角入口可随时重新打开。

展开 Token 分组，使用拾色器或输入 CSS 值。支持主色、前景/背景、状态、侧栏、图表颜色；基础字体、字号、字重、行高；圆角、阴影、面板边框；页面与卡片间距、表格最小行高和单元格间距、控件高度。全部作用于真实组件，不使用另画的预览模型。Dashboard 复用数据管理指标与表格，Charts 使用工业监测图表，Form / Dialog 使用项目现有表单和基础组件。

- 留空的 Token 跟随源码；手动覆盖值按 `preset:resolvedMode:density` 隔离，切换后不会混用颜色。
- 无效 CSS 值会显示错误并暂用源码值，修正后才能暂存或导出。
- “暂存调整”写入独立 localStorage 键 `react-boilerplate:playground-draft:v1`，刷新或重新进入时恢复；未暂存的改动离开后丢弃。
- “撤销调整”撤回最近一次编辑，包含面板内的主题、模式、密度与布局，最多记录 50 步。
- “恢复项目配置”清除所有覆盖和暂存，恢复进入页面时的应用外观选择，并继续使用当前源码 Token。
- 导出 JSON / 复制给 AI Agent 只生成预览配置，不会写源码；剪贴板权限不可用时可在弹窗中手动复制。

复用既有 AppearanceProvider / LayoutProvider 的临时会话，正式外观存储不被覆盖，离开 Playground 后清理内联 Token 并恢复应用外观。页面期间修改的是文档根变量，以便真实 Sidebar 和传送到 body 的 Dialog / Popover 同步预览；不另外维护主题系统。

新增手动字段在 `src/containers/DesignPlayground/preview/fields.js` 注册。`usePreview.js` 处理暂存、历史与 Token 覆盖；`PreviewPanel.js` 组合现有表单组件。CSS 基线在热更新后重新读取，用户未覆盖的变量立即体现代码变化；已覆盖变量需留空或恢复配置，才能显示对应源码值。共享 Token 补充了正文基础字重/行高、可选页面间距、卡片内部间距与表格行高，默认值延续现有布局。

### AI Agent 与源码修改

将导出的 JSON 交给 Agent，明确目标预设和浅深色，再修改 `src/design-system/tokens/` 对应文件或组件样式。JSON 的 `profiles` 是覆盖值，不是完整主题；不要把预览 storage 或内联样式当成正式设计配置。密度与预设的间距计算应沿用既有 Token。修改后用未覆盖的预览验证 HMR，并执行项目检查。

### 开发和生产边界

路由、顶部开发工具入口、lazy import 都由 `import.meta.env.DEV` 控制。`npm run dev` / `dev:mock` 的右上角调色板图标直接进入 Playground，不再提供外观设置弹出菜单。生产和 staging 构建不注册路由、不显示该图标，也不生成 Playground / ComponentGallery 专用 JS 分包。生产访问 `/design-playground` 显示 404。正式应用使用项目配置的默认外观，保留 Provider 与主题能力，但暂不向最终用户提供外观选择界面。

## 验证与扩展检查

```bash
npm run test:design
npm run eslint
npm run stylelint
npm run format:check
npm run build
```

浏览器检查至少覆盖三预设 × 浅深两模式、系统偏好实时变化、刷新持久化，以及 1440 / 1024 / 390px。验证切换预设和布局时输入、搜索与弹窗状态不丢失；检查键盘 Tab、Escape、焦点恢复和移动端导航。默认、舒适、紧凑分别检查输入高度、表格与容器间距。

检查关键文本与相邻背景达到 WCAG AA 普通文字 4.5:1；状态不能仅用颜色；图表提供可读摘要；启用 reduced motion 时减少动画。自动检查不能代替真实屏幕阅读器与完整键盘人工审查。

截图与交互验证使用静态示例，不需要后端。真实业务、鉴权和接口联调另行按 AGENTS.md 验证。
