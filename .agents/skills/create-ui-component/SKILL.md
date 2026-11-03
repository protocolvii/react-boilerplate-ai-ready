---
name: create-ui-component
description: 新增、提取可复用的 React 公共 UI 或专业业务组件，以及扩展公共组件的重要交互和变体时使用。组织组件发现、实现、Gallery 同步和验证；不用于简单文案、局部样式修复或一次性页面内部组件。
---

# 创建公共 UI 组件

在现有脚手架中完成组件开发与收尾。以下源码路径相对仓库根目录；先读取 [AGENTS.md](../../../AGENTS.md)，只追加当前任务涉及的文档章节，不复制或重新定义设计规范。

## 1. 发现与选型

- 按 [组件开发](../../../docs/ai-design/component-development.md) 判断基础组件、公共业务组件和页面内部组件；没有稳定复用价值时不强行提取公共组件。
- 先检查 `src/components/` 的实际 API，再检查 Component Gallery 的 Preview 与注册信息。针对缺失能力查询 shadcn/ui 官方 Registry、文档及组合示例，决定直接复用、组合封装或自行实现，并说明自定义基础实现的原因。
- 查询入口和降级方式见 [shadcn 查询指南](../../../docs/shadcn-discovery.md)。已有官方 Skill / MCP 可以使用，但不是前置条件；没有时通过官方文档、仓库或 CLI 查询。不要自动安装个人工具或修改用户配置；网络不可用时说明尚未核实的能力，不宣称官方没有对应组件。
- 检查 `components.json` 和现有基础实现，保持 JavaScript / JSX、路径别名和 Radix 体系一致。日期选择先检查 Calendar + Popover，进度先检查 Progress；不批量安装，不覆盖已定制的同名组件，不混用不兼容实现。

## 2. 实现与工程接入

- 阅读 [设计系统](../../../docs/design-system.md) 中相关 Token、组件和布局规则。明确 Props、事件、受控状态、变体及实际需要的加载、禁用、错误和空状态，提供必要的可访问性反馈。
- 公共业务组件放在 `src/components/<Name>/index.js`，通过 `src/components/index.js` 命名导出；shadcn CLI 基础组件保持 `src/components/ui/` 的官方 `.jsx` 文件及直接导入方式，不为导出形式统一而额外包装。
- 复用语义 Token 和现有组件。修改已有组件 API 时同步调用方与使用示例；不顺带改变全局 Design Profile、鉴权或工具链。

## 3. 同步 Component Gallery

- 纳入公共组件体系时，按 [Component Registry](../../../docs/design-playground.md#component-registry新增公共组件) 编写真实可交互 Preview，在 `src/containers/DesignPlayground/gallery/component-registry.js` 注册或补充现有分类。
- Preview 使用稳定示例数据，展示与组件有关的正常、禁用、加载、错误或空状态；不连接真实业务接口，不重复挂载 App Shell，不从生产组件导入开发注册表。
- CLI 安装的基础组件可融入现有组合展示，不要求每个文件都有独立展示页。页面内部组件不强制注册；未注册时说明原因。整页组合属于通用模板时使用 Page Gallery 分支，不当作单个公共组件注册。

## 4. 验证与交付

- 逐项核对新增公共导出与 Preview / Registry 的对应关系。运行 `npm run check:registry`，但它只能检查已注册条目，不能证明没有漏注册，也不能证明 Preview 可渲染。
- 按 [单元与组件测试](../../../docs/unit-testing.md) 对重要交互补充并运行 Vitest / RTL 测试，优先验证用户可观察的行为；不为简单静态 UI 机械补测试。
- 按 [浏览器验证](../../../docs/browser-verification.md) 用 Playwright 实际打开对应 Gallery Preview，检查必要交互、主题和移动端表现。已有 E2E 通过不代表新增 Preview 已验证；涉及全局 Tokens 时额外执行 `npm run test:design` 并检查受影响的 Playground 主题、密度及输入状态。
- 按 [任务收尾检查](../../../docs/development.md#任务收尾检查) 选择格式、Lint、测试与构建检查。失败时调查原因，不通过删除断言、跳过测试或擅自更新视觉基准掩盖问题。
- 交付说明组件类型、文件与公共导出位置、选型依据、Gallery 对应项或未注册原因、使用方式、实际测试命令及结果、浏览器产物和未验证项。查询与测试没有实际执行时明确说明；不自动提交 Git。
