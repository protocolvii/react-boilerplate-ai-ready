# HTML / React Prototype

用户可以直接要求可运行原型，不需要先生成设计图片。以 [AI Design Guidelines](../ai-design-guidelines.md) 和 [AGENTS.md](../../AGENTS.md) 为共同约束。

## 在当前工程运行

采用现有 React + JavaScript，业务 JSX 写在 `.js`。使用 shadcn/ui、Lucide、Tailwind、语义 Token 与已有 Layout，不创建第二个项目、主题系统或独立样式框架。配置、模板、路由接入见 [业务开发指南](../development.md)。如果用户明确要独立 HTML 交付，应说明与项目 React 原型的区别，不为此修改应用根模板或构建工具。

先检查已有组件、注册表和 [页面模板](../page-templates.md)，所需基础控件按 [组件发现与选型](component-development.md#组件发现与选型) 批量核查，不因原型交付速度要求跳过官方能力复用。按实际场景组织内容与操作，避免机械 Card 堆叠；不因选择某主题而改变交互行为。

## 数据与必要交互

静态数据可放在模块 data.js 或 Preview 中；需要走实际业务请求链时使用已有 dev:mock 和相同协议，不额外构建 Mock 子系统。实现用户要求的搜索、筛选、分页、表单、弹窗、确认或导航，不把可点击外观当作已完成交互。

输入草稿与提交查询区分；表单提供 label、基本浏览器校验、业务错误与防重复提交；必要时展示加载、空、失败、禁用状态。用户未要求真实 API 时不制造服务调用或假装已联调。

## 视觉与复用

检查 Light / Dark、三种密度、合理的 1440 / 1024 / 390px 布局与键盘交互。不要逐预设复制 JSX；通过 Token 和已有变体适配。

有复用价值的组件编写 Preview 并注册 Component Gallery；通用页面模板注册 Page Gallery，步骤见 [Design Playground](../design-playground.md)。一次性原型不强制收录。原型转正式页面时沿用同一视图组件，将静态数据与 API 适配分离，避免长期保留两份视觉实现。

交付开发访问路径、交互说明、数据范围、实际检查结果与待接入事项。原型完成不意味着真实权限、后端或异常流程已经完成。

可交互 React 原型按 [浏览器验证](../browser-verification.md) 用 Playwright 检查实际页面、关键操作和响应式；抽出的公共组件按 [单元与组件测试](../unit-testing.md) 覆盖有意义的交互。按 [任务收尾检查](../development.md#任务收尾检查) 选择适用项目，明确静态 / Mock 边界；一次性原型不因此强制注册 Gallery 或制造真实 API 接入。
