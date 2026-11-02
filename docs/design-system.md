# Design System

本系统面向长期复用的管理后台。业务页面共享语义 Token、shadcn/ui 基础组件和业务组件；主题、颜色模式、密度与布局分别选择。设计预览入口为本地开发服务的 `/design-playground`，无需登录，示例使用页面内静态数据，不调用业务数据 API；全局顶栏仍沿用已有登录态恢复，存在会话时可请求用户信息。

## AI 开发入口

1. 阅读本文与 AGENTS.md，再检查实际组件源码。
2. 默认使用 Modern SaaS、浅色模式、Default 密度和 Standard Admin 布局。
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

每个预设均定义 Light / Dark。颜色模式默认为 Light，支持手动切换 Dark；旧配置中的 System 自动归一化为 Light。预设不会强制更改用户密度或布局；例如 Creative AI 也能使用 Compact 和 Monitoring。

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
src/containers/DesignPlayground/  开发预览、配置面板、组件与页面注册表
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

## 项目 Design Profile

Design Profile 指项目已经确认的 preset、colorMode、density 和 layout 组合，以及对应 Token 的源码值，不是额外的配置服务。未定制时以 `appearance/settings.js` 的 DEFAULT_APPEARANCE 和 LayoutProvider 默认值为准：Modern SaaS / Light / Default / Standard Admin。AI 先检查当前代码与用户确认的风格；不能仅因业务属于工业或 AI 就擅自替换整个项目的视觉预设。需要新视觉方向时可以提出扩展，不限于三套预设，但不要在单页硬编码另一套主题。

## 排版与间距标尺

| 项目                | 当前默认值与约定                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 英文 / 中文         | Inter Variable；中文回退 PingFang SC、Microsoft YaHei、system-ui、sans-serif，统一由 `--font-body` 定义              |
| 正文                | `--text-body: 0.875rem`（14px），`--font-weight-body: 400`，`--line-height-body: 1.5`；Tailwind text-sm 引用正文字号 |
| 页面标题            | `--text-title: clamp(1.125rem, 1.6vw, 1.25rem)`，约 18–20px；标题字重为预设的 `--heading-weight`                     |
| 辅助文字            | `--text-caption` / text-xs，默认 12px；不通过持续缩小字号提高密度                                                    |
| 数字                | tabular-nums 保持数字等宽；`--font-data` 提供系统等宽字体，Industrial Pro 的指标使用该字体                           |
| 页面 / 卡片内边距   | `--page-space` 默认回退 `--panel-space`；Modern SaaS 的 Default / Comfortable / Compact 分别为 24 / 32 / 16px        |
| 区块 / 卡片内部间距 | `--layout-gap` 分别为 16 / 24 / 12px；`--card-gap` 默认回退区块间距                                                  |
| 表格                | `--table-cell-space` 为上下内边距，分别 12 / 16 / 8px；`--table-row-height` 可设置最小行高，默认按内容计算           |
| 默认控件            | `--control-height` 分别为 36 / 44 / 32px；保留显式 size 变体和触摸设备最小高度                                       |

间距会叠加预设的 `--preset-space-scale`：Modern SaaS 为 1、Industrial Pro 为 0.92、Creative AI 为 1.06。优先使用上述变量与 Tailwind 原有间距等级，不重复包装每个数值，不随意改变已有 class。

## 组件外观与交互状态

- 圆角引用 `--radius` 及派生工具类，三预设的基准分别为 10 / 6 / 14px；不能只更换 primary 冒充新风格。
- 面板引用 `--panel-shadow`、浮层引用 `--shadow-overlay`，边框使用 border-border 与 `--border-width`；避免多层无用途的 Card。
- Hover 使用 accent 或组件现有 variant；Focus 保留清晰的 ring / outline，不移除键盘焦点。
- Disabled 使用原生 disabled 与组件样式；Loading 结束前阻止重复提交，必要时设置 aria-busy 或 role=status。
- Error 文字需说明原因，并通过 aria-invalid / aria-describedby 关联字段；错误、告警和在线状态同时使用文字或图标。
- 动画引用 motion Token，尊重 prefers-reduced-motion，不为每个组件添加动画。
- 注册示例覆盖有意义的变体与状态，普通业务开发组合组件；不要为了预览重写 shadcn/ui 的行为。

## AppearanceProvider

Root 已挂载 Provider。模板插件在 head 注入与 Provider 共用的初始化脚本，CSS 与 React 加载前设置 `data-theme`、`data-density`、`data-color-mode`、`.dark` 和 `color-scheme`，避免深色首屏闪白。新增预设不要另写一份首屏逻辑。

```js
import { useAppearance } from '@/design-system/appearance/context';

const { preset, colorMode, density, resolvedMode, updateAppearance, resetAppearance } = useAppearance();
updateAppearance({ preset: 'industrial-pro' });
updateAppearance({ colorMode: 'light', density: 'compact' });
```

`resolvedMode` 是实际 light/dark，`colorMode` 仅支持 light/dark。全局 Sonner 使用实际模式。主题切换更新变量，不重新挂载业务页面，搜索、表单与弹窗状态应保留。

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

布局自身包含 MainHeader / MainMenu / MainPage，不要再重复挂载。顶部栏仅在开发环境显示直达设计系统的图标，所有外观调整集中在 Playground，最终用户没有样式或颜色模式选择入口；桌面侧栏可折叠，移动端使用 Sheet。小于 1280px 时右侧面板移至正文下方，小于 768px 或设备为无悬停的粗指针触屏时使用左上角按钮打开抽屉导航，手机和平板横屏也保持此方式，正文不预留侧栏宽度。宽表格在表格容器内横向滚动，不让整个页面溢出。

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

| 组件            | 主要 props                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------ |
| PageHeader      | title、info、breadcrumb、actions、children                                                 |
| SectionHeader   | title、description、actions、id                                                            |
| MetricCard      | label、value、detail、icon、className                                                      |
| StatusIndicator | tone、label、className                                                                     |
| EmptyState      | title、description、actions                                                                |
| SearchToolbar   | value、onChange、onSubmit、placeholder、actions、children                                  |
| FilterBar       | summary、children                                                                          |
| DataTable       | columns、rows、rowKey、sort、onSort、loading、caption、emptyTitle、emptyActions、className |
| ConfirmDialog   | open、onOpenChange、title、description、confirmLabel、onConfirm                            |

DataTable 列定义为 `{ key, header, sortable, render, className, headerClassName }`，render 接收整行数据；排序和分页由页面控制。它不是完整表格引擎，不隐式请求接口。ConfirmDialog 等待 onConfirm 的 Promise，处理中禁用重复操作，失败保留对话框并显示错误。

业务失败、权限、加载状态依实际接口处理，不能直接沿用静态示例的成功行为。对话框需标题、描述；图标按钮需 aria-label；表单需 Label 和错误关联；通知在事件或 effect 中触发。

## Playground 与协作规范

使用与注册方法见 [Design Playground](design-playground.md)，通用模板见 [页面模板](page-templates.md)，不同设计任务的选择见 [AI Design Guidelines](ai-design-guidelines.md)。开发工具继续使用现有 Provider 和右侧配置面板，不是另一套主题或正式设计配置。

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

## 日期与进度

从 `@/components` 导入 DatePicker、ProgressBar。两者分别组合官方 shadcn Calendar / Popover 和 Progress；基础源码位于 `src/components/ui/`，业务包装位于各自的目录。

- DatePicker：`value` / `defaultValue` / `min` / `max` 使用本地日期 `YYYY-MM-DD`；`onChange(value)` 返回日期字符串，清空返回空字符串。支持 `id`、`name`（隐藏表单字段）、`disabled`、`placeholder`、`className` 和 ARIA 属性。用 Label 关联触发按钮。日历为中文，支持年月切换；它不是原生日期输入，不自动执行原生 required 校验，表单需在提交时校验必填和业务日期范围。
- ProgressBar：`value` 为 0–100 的数值，超出范围自动限制；`null` 表示不确定进度。`label` 提供可访问名称，`showValue` 默认显示百分比，`className` 设置容器宽度。仅需基础进度轨道时可直接导入 `@/components/ui/progress` 的 Progress。

组件库中“日期选择”和“进度条”使用真实组件，分别展示日期约束 / 禁用 / 错误和可调整进度 / 零值 / 完成 / 不确定状态。通用列表页复用这两个公共组件。
