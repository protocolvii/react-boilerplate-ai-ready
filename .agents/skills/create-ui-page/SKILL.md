---
name: create-ui-page
description: 在现有 React JavaScript 脚手架中新增业务页面、可交互 React 原型、根据设计图片实现页面、创建通用页面模板或将已确认原型工程化时使用。组织组件复用、工程接入和浏览器验证；不用于只生成设计图片或简单局部修复。
---

# 创建 UI 页面

在现有项目内实现页面，不另起应用。以下源码路径相对仓库根目录；先读取 [AGENTS.md](../../../AGENTS.md)，根据交付类型只读取需要的规范。

## 1. 确定交付类型

| 类型              | 实施入口                                                              | Gallery 要求                                    |
| ----------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| 普通业务页面      | [业务开发指南](../../../docs/development.md) 的页面接入及所用功能章节 | 不自动加入 Page Gallery                         |
| 可交互 React 原型 | [React 原型规范](../../../docs/ai-design/html-prototype.md)           | 一次性原型不强制注册；明确静态数据与已接入能力  |
| 通用页面模板      | [页面模板](../../../docs/page-templates.md)                           | 创建内容 Preview、同步 Page Registry 与模板说明 |

有设计图片时先实际查看图片，再按 [Design to Code](../../../docs/ai-design/design-to-code.md) 分析布局、组件、响应式及无法从图片确定的交互。用户不需要先生成图片或 HTML 原型；已确认的原型可以直接工程化。

## 2. 检查设计与组件能力

- 阅读 [设计系统](../../../docs/design-system.md) 的相关章节，检查 `src/design-system/project-design.json`、语义 Tokens、已有 Layout 和模板，不擅自改变已确认的全局设计基线。
- 列出页面所需组件，批量检查 `src/components/` 的实际 API 和 Component Gallery，再针对缺失能力查询 shadcn/ui 官方 Registry、文档及组合示例。优先复用或组合封装，能力不足再说明原因自行实现；不为赶出整页而重复编写基础组件。
- 按 [shadcn 查询指南](../../../docs/shadcn-discovery.md) 使用当前可用的官方工具、文档、仓库或 CLI。官方 Skill / MCP 可选，不自动安装或改用户配置；未能在线核实的选型要说明。保持当前 Radix、JavaScript / JSX 和别名配置，不覆盖定制组件或批量安装。
- 日期选择先检查 Calendar + Popover，进度先检查 Progress；DataTable 是否组合 TanStack Table 取决于实际功能，不为了页面开发更换现有表格实现。

## 3. 实现与接入

- 业务页面使用 `.js`，按需放在 `src/containers/<ModuleName>/index.js`。选择现有 StandardAdminLayout / WorkspaceLayout / MonitoringLayout 或 PageLayout，不重复创建顶部栏、侧栏和偏移计算。
- 按交付目标实现表单、搜索、分页、弹窗等交互，覆盖实际涉及的加载、空数据、失败及重复提交状态。只有需要时才接入现有 API、Redux 或 Vite Mock；不修改鉴权绕过后端，不把静态演示宣称为真实接口验证。
- 需要正式业务路由时同步 `src/containers/index.js`，在 `src/routes.js` 兜底路由之前配置 `{ path, component, needAuth }`，其中 component 是组件函数。业务后台默认 `needAuth: true`；菜单和 reducer 按需接入，不机械创建整套模块。
- 原型也使用当前工程入口与既有登录保护，只有明确公开的页面才取消保护。仅用于 Gallery 的模板 Preview 不必额外新增业务路由。
- 页面中确实产生新的可复用公共组件时，按 [公共组件流程](../create-ui-component/SKILL.md) 完成必要导出与 Component Gallery 同步；不要把每个页面局部结构都抽成公共组件。

## 4. 条件同步 Page Gallery

- 仅通用模板按 [Page Registry](../../../docs/design-playground.md#page-registry新增通用页面模板) 在 `src/containers/DesignPlayground/gallery/page-registry.js` 注册，并同步 `docs/page-templates.md`。
- Preview 使用真实项目组件与稳定示例数据，复用 Playground 外层布局，仅渲染模板内容。普通业务页或一次性原型不因使用了公共组件就自动注册。
- 有注册改动时运行 `npm run check:registry`，并实际打开新增模板 Preview；检查器不会发现尚未注册的模板，也不能代替浏览器渲染验证。

## 5. 浏览器验证与交付

- 按 [浏览器验证](../../../docs/browser-verification.md) 使用 Playwright 打开真实页面 URL，检查直达、刷新、登录返回、关键交互、适用的异常与空状态、桌面和移动端、控制台错误及非预期横向溢出。模板还要验证对应 Playground 预览切换。
- 图片转页面需在可比较的视口和数据下截图检查，说明主要差异；不自动更新视觉基准。关键页面交互按需补充 E2E，抽出的逻辑或重要组件交互参考 [单元与组件测试](../../../docs/unit-testing.md)，避免重复测试同一流程。
- 修改全局 Tokens 时额外运行 `npm run test:design`，并按 [Playground 规范](../../../docs/design-playground.md) 检查受影响的主题、浅深色、密度、响应式与输入状态；普通局部页面修改不强制执行完整主题矩阵。
- 按 [任务收尾检查](../../../docs/development.md#任务收尾检查) 选择 Lint、格式、测试和必要的生产构建；不能把开发服务验证等同于生产隔离验证。测试失败先调查原因，不删断言或跳过测试掩盖问题。
- 报告交付类型、修改文件、实际访问地址、组件选型、数据来源（静态 / Mock / 真实 API）、工程接入、Gallery 同步或不适用原因、实际执行的命令及结果、截图 / Trace 位置、未完成和未验证项。不能运行浏览器时明确说明；不自动提交 Git。
