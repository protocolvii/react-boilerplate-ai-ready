# Design Playground

这是长期存在于本地开发环境中的设计参考与验证工具。通过应用右上角调色板图标或 `/design-playground` 进入，生产与 staging 无入口和路由。它不调用 AI、不生成设计稿、不承载正式业务。

## 三个组成部分

| 部分                  | 当前实现                                        | 用途                                                         |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| Design System Preview | 既有右侧设计配置面板、真实页面 Shell 和组件     | 预设、Light / Dark、字体、颜色、圆角、阴影、间距、密度与布局 |
| Component Gallery     | “组件库”页签，可搜索名称 / 标签并按实际分类筛选 | 基础 UI 与可复用业务组件的状态和用法                         |
| Page Gallery          | 通用列表页、Dashboard、工业监测、AI 工作台页签  | 现有完整页面示例与可复用模板，共用外层 PageLayout            |

主题与布局规则见 [设计系统](design-system.md)。页面模板说明见 [page-templates.md](page-templates.md)。根据用户任务选择 [AI 协作规范](ai-design-guidelines.md)，不规定图片、原型或业务开发的先后顺序。

## 当前预览内容

`/design-playground` 的页面页签由 Page Registry 生成，组件画廊由 Component Registry 生成：

- 数据管理：搜索、状态过滤、排序、分页、编辑/新增 Dialog、归档确认和空状态。
- 通用列表页：独立筛选区、通用项目字段、固定操作列、详情 / 新增 / 编辑 / 删除与分页。
- 工业监测：指标、带单位与阈值的 SVG 趋势图、设备表格、告警时间线，刷新为本地示例数据。
- AI 工作台：静态项目资源、结果卡片、工作区导航和上下文面板，不提供 AI 对话或任务发送。
- 组件画廊：按钮、表单控件、Select、Checkbox、Radio、Switch、Dialog、Sheet、Popover、Tooltip、Tabs、Badge、Alert、Skeleton、Card、Separator。

示例数据在 data.js 中固定，便于截图比较，演示业务数据不持久化。Playground 是本地预览工具，不连接 AI，不提供对话能力。使用 VS Code 中的 Codex 或其他 Agent 编辑代码，由 Vite 热更新页面。

### 手动实时调整

点击页面标题旁或右下角的“设计配置”打开面板。配置分为“外观配置”和“样式微调”两个页签，面板独立滚动，预览页面不再被配置表单向下挤占。右侧面板覆盖在页面上方，不改变预览区域宽度或触发布局重排；宽屏下可操作未被遮挡的预览区域，平板和手机使用抽屉。关闭面板即可查看完整效果。点击面板外的预览区域、隐藏按钮或按 Escape 可关闭，当前调整与撤销历史保留；右下角入口可随时重新打开。

展开 Token 分组，使用拾色器或输入 CSS 值。支持主色、前景/背景、状态、侧栏、图表颜色；基础字体、字号、字重、行高；圆角、阴影、面板边框；页面与卡片间距、表格最小行高和单元格间距、控件高度。全部作用于真实组件，不使用另画的预览模型。Dashboard 复用数据管理指标与表格，Charts 使用工业监测图表，Form / Dialog 使用项目现有表单和基础组件。

- 留空的 Token 跟随源码；手动覆盖值按 `preset:resolvedMode:density` 隔离，切换后不会混用颜色。
- 无效 CSS 值会显示错误并暂用源码值，修正后才能暂存或导出。
- “暂存调整”写入独立 localStorage 键 `react-boilerplate:playground-draft:v1`，刷新或重新进入时恢复；未暂存的改动离开后丢弃。
- “撤销调整”撤回最近一次编辑，包含面板内的主题、模式、密度与布局，最多记录 50 步。
- “恢复项目配置”清除所有覆盖和暂存，恢复源码中最近保存的项目外观选择，并继续使用当前源码 Token。
- 导出 JSON / 复制给 AI Agent 只生成预览配置，不会写源码；剪贴板权限不可用时可在弹窗中手动复制。

复用既有 AppearanceProvider / LayoutProvider 的临时会话，正式外观以源码为准，离开 Playground 后清理内联 Token 并恢复应用外观；外观和布局不自动写入浏览器缓存。页面期间修改的是文档根变量，以便真实 Sidebar 和传送到 body 的 Dialog / Popover 同步预览；不另外维护主题系统。

新增手动字段在 `src/containers/DesignPlayground/preview/fields.js` 注册。`usePreview.js` 处理暂存、历史与 Token 覆盖；`PreviewPanel.js` 组合现有表单组件。CSS 基线在热更新后重新读取，用户未覆盖的变量立即体现代码变化；已覆盖变量需留空或恢复配置，才能显示对应源码值。共享 Token 补充了正文基础字重/行高、可选页面间距、卡片内部间距与表格行高，默认值延续现有布局。

### AI Agent 与源码修改

将导出的 JSON 交给 Agent，明确目标预设和浅深色，再修改 `src/design-system/tokens/` 对应文件或组件样式。JSON 的 `profiles` 是覆盖值，不是完整主题；不要把预览 storage 或内联样式当成正式设计配置。密度与预设的间距计算应沿用既有 Token。修改后用未覆盖的预览验证 HMR，并执行项目检查。

### 开发和生产边界

路由、顶部开发工具入口、lazy import 都由 `import.meta.env.DEV` 控制。`npm run dev` / `dev:mock` 的右上角调色板图标直接进入 Playground，不再提供外观设置弹出菜单。生产和 staging 构建不注册路由、不显示该图标，也不生成 Playground / ComponentGallery 专用 JS 分包。生产访问 `/design-playground` 显示 404。正式应用使用项目配置的默认外观，保留 Provider 与主题能力，但暂不向最终用户提供外观选择界面。

## Component Registry：新增公共组件

注册表：`src/containers/DesignPlayground/gallery/component-registry.js`。每项包含 id、name、category、description、preview，可选 tags。preview 必须是 React 组件引用，可使用 React.lazy；不要传已创建的 JSX 元素或字符串。ID 使用小写字母、数字、连字符，在两个注册表中保持唯一。

1. 在 `src/components/<Name>/index.js` 实现组件，并从业务组件 index.js 导出；官方基础组件仍从 ui 文件直接引入。
2. 在 `gallery/previews/` 创建 Preview，直接组合真实组件，提供静态数据和本地事件；不要复制组件源码。
3. 注册记录。组件画廊自动生成标题、描述、分类、搜索与展示，不需要再改 ComponentGallery 的 JSX。
4. 检查必要的变体和状态、主题、密度、响应式、键盘以及相邻控件的 label / id；多个示例同时渲染时使用 useId。
5. 执行注册检查与实际浏览器预览。

```js
import { lazy } from 'react';

// 示例：添加到 componentRegistry 数组，Preview 文件需实际创建。
{
  id: 'device-summary',
  name: '设备摘要',
  category: 'Business',
  description: '设备标识、状态与关键指标的组合。',
  tags: ['DeviceSummary', 'StatusIndicator'],
  preview: lazy(() => import('./previews/DeviceSummaryPreview.js'))
}
```

该示例文件应 default export 一个函数组件；使用命名导出时按现有 basic / business 辅助函数映射为 lazy 的 default。已有 BasicPreviews 保留基础 UI 展示，BusinessPreviews 提供公共业务组件状态。密切相关的组件可以共用一个预览组，通过 tags 列出真实组件名；新增独立组件不要只给无关组增加标签而不提供示例。

分类只使用已有或实际新增的分类，不预建空分类。目前为 Basic、Form、Feedback、Business。布局 Shell 已在整个 Playground 中展示，MainHeader / MainMenu 等固定结构不在 Gallery 中重复挂载。一次性页面内部辅助组件无需注册。

## Page Registry：新增通用页面模板

注册表：`src/containers/DesignPlayground/gallery/page-registry.js`。字段与组件表一致，另有可选 layout，合法值为 standard-admin / workspace / monitoring。id 同时用于 `?view=<id>` 深链和页签；不要使用保留 ID `components`，不要随意改动已有 data / monitoring / workspace 地址。

1. 提取可复用的页面内容与交互组件，数据通过 props 或适配层提供。
2. 在 `gallery/previews/` 写轻量适配组件，确保静态数据可独立预览，不需要真实 API 或特定业务 Redux 模块。
3. 注册记录，顶层页签与 PageGallery 自动显示，不需要重复注册正式业务路由。
4. 在 [页面模板](page-templates.md) 记录用途、数据范围、状态及适用布局。
5. 验证深链、切换、主题、密度和生产隔离。

```js
{
  id: 'device-detail',
  name: '设备详情',
  category: 'Detail Page',
  description: '设备信息与采集状态的详情模板。',
  tags: ['Device', 'Detail'],
  layout: 'standard-admin',
  preview: lazy(() => import('./previews/DeviceDetailPreview.js'))
}
```

layout 是模板建议，不会强制切换用户的布局。PageGallery 由已有 PageLayout 提供共用 Shell；注册 Preview 只渲染内容，不再套 MainHeader / MainMenu / MainPage。如果正式页面拥有自己的 Layout，抽出同一内容组件供页面和 Preview 引用；不要复制另一份视觉实现。普通业务页面不要求全部收录。

## 检查与变更边界

```bash
npm run check:registry
npm run test:design
npm run eslint
npm run format:check
npm run build
```

注册检查校验必填字段、重复 ID、preview 引用、tags 与合法布局；单元测试还验证过滤与错误配置。lazy 预览模块是否真正能加载、交互和视觉是否正确，需要在开发浏览器逐项检查，不能只凭注册元数据通过就宣布完成。

新增预览只被开发入口引用。不要从正式组件、reducers 或业务入口导入 Gallery 或注册表。生产构建应继续不存在 Playground 路由、顶部图标和专用预览 JS；Tailwind 可能扫描到预览使用的工具类，这不代表生产注册了开发工具。修改全局 Token 时还需执行 Stylelint，检查三预设浅深色、三密度、1440 / 1024 / 390px、焦点与状态保持。

## 保存到项目

设计配置面板底部的“保存到项目”在外观配置与样式微调两个页签都可使用。调整仍先即时预览，保存时才修改以下源码：

- `src/design-system/project-design.json`：项目默认预设、浅深色、密度和布局，以及各分组已保存的 Token 覆盖。
- `src/design-system/tokens/project.css`：由上述配置生成的全局覆盖样式，随正式项目一起构建。选择器同时限定预设、颜色模式和密度，不覆盖其他分组。

保存合并当前调整，未编辑的已保存分组不变。编辑某项后清空并保存会删除该项覆盖，回到基础主题 Token。不要只手改生成 CSS 后再通过面板保存，否则生成内容会以 JSON 为准；需要源码定制时优先修改基础 Token 或同步 JSON。默认外观变化可能触发 Vite 重载；保存后的配置可刷新验证。

保存完成提示“已写入项目文件，尚未 Git 提交”，不会自动提交或推送。“恢复项目配置”只放弃当前未保存调整，恢复最近保存的项目设置；撤销已经写入的源码使用 Git。暂存是当前浏览器中的草稿；JSON 导出与复制配置用于备份、分享或交给 Agent，并不是保存源码的前置步骤。

`/__design-project` 仅由 Vite 开发服务提供，生产构建与 preview 不注册写入接口。服务端限定文件路径、主题分组与 Token 名，拒绝跨站调用、过大数据和 CSS 注入；保存前校验文件版本，源码被其他编辑器或浏览器修改后拒绝覆盖，刷新后再编辑保存。写入失败保留页面调整，界面显示错误；双文件写入失败尝试恢复原内容。
