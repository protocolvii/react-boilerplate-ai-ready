# Component Development

适用于公共组件、专业组件、页面内组件和直接业务开发，不要求先做图片或原型。共同规则见 [AI Design Guidelines](../ai-design-guidelines.md)，接口与 Redux 细节见 [业务开发指南](../development.md)。

## 组件发现与选型

新增页面或组件前按以下顺序发现能力，不直接从零实现基础控件：

1. 检查 `src/components/index.js`、目标组件源码及 `src/components/ui/`，确认实际 API、已有定制和使用位置。
2. 检查 Component Gallery、`src/containers/DesignPlayground/gallery/component-registry.js` 和真实 Preview，了解项目已验证的变体与交互；不能只凭名称或 tags 推测能力。
3. 对缺失能力、能力不匹配或组合方式不确定的部分，查询 shadcn/ui 官方 Registry、组件文档及推荐组合示例；新页面先批量列出所需组件，再集中查询缺口，不为每个现有按钮重复查询。
4. 根据需求选择直接复用、组合已有组件或必要的业务封装，保持 Design Tokens 和公开 API 的一致性。
5. 确认现有及官方能力确实不足后才自行实现基础能力，交付时说明缺口和不采用已有方案的原因；不要为了复用强行套用不适合的组件。

| 需求         | 优先检查                                                                                                   | 选型边界                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 日期选择     | 项目 DatePicker；官方 [Calendar + Popover 组合](https://ui.shadcn.com/docs/components/radix/date-picker)   | 不因为没有名为 DatePicker 的基础文件就自行绘制日历                                        |
| 完成进度     | 项目 ProgressBar；官方 [Progress](https://ui.shadcn.com/docs/components/radix/progress)                    | 可直接使用基础组件；仅有额外语义、数值显示等需求时使用或补充包装                          |
| 复杂数据表格 | 项目 DataTable；官方 [Table + TanStack Table 指南](https://ui.shadcn.com/docs/components/radix/data-table) | 按列状态、选择等实际能力缺口评估 TanStack Table，不因页面名为列表就新增依赖或替换现有表格 |

安装与工具边界：

- 当前 `components.json` 为 `new-york`、`tsx: false`；已安装基础组件采用 Radix UI 体系。先核对具体文件和依赖，不因官网默认示例变化混入不兼容的 Base UI / 其他实现，也不照搬 TSX 或 Next.js 专用结构。
- 通过官方 CLI 按需添加最少组件；安装前检查同名文件及定制，不盲目使用覆盖选项，不批量安装所有组件。沿用现有别名和 JavaScript 配置，不为工具接入重构项目。
- 官方 Skill / MCP 可用时用于发现与查询；不可用时继续使用官方 CLI 或官方文档，不把工具安装当成普通开发的前置阻塞。依赖和基础体系变更需说明实际需求。
- 官方 Registry、CLI 或 MCP 用于查找可安装能力，不是本项目的 Component Gallery 注册表。安装后的公共导出、Preview 和注册按下节分层决定。

## 判断组件层级

| 类型               | 位置 / 做法                                                    | Gallery 要求                                             |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------------------- |
| 基础 UI            | `src/components/ui/`，优先 CLI 添加，沿用标准组合式 API        | 按实际用途补充已有预览组，避免每个基础组件另建无意义展示 |
| 通用业务组件       | `src/components/<Name>/index.js`，从 components/index.js 导出  | 创建 Preview，加入 Component Registry                    |
| 专业业务组件       | 已形成明确跨页面用途时放公共组件；仍依赖某业务模块时留在模块内 | 有稳定复用价值时提供隔离的 Preview 和分类                |
| 一次性页面内部组件 | `src/containers/<ModuleName>/` 内就近组织                      | 不强制注册，不为了 Gallery 强行公共化                    |

业务文件使用 `.js`，官方 shadcn/ui 使用 `.jsx`。当前不使用 TypeScript Props；用清楚的参数名、默认值、必要的 JSDoc / 文档表格表达 props、回调参数、受控状态和异步返回约定。不要从其他库猜测 loading、htmlType 等不存在的 API。

## Props、变体与状态

- 优先原生组合方式、children、必要的 className / variant / size；复用 cn，避免一层又一层只透传的包装。
- 输入、选择、排序、分页等明确是否受控。回调不能在 render 中触发；副作用放 effect 或事件处理器。
- 按用途提供 Hover、Focus、Disabled、Loading、Error、Empty、Success；不是所有组件都需要全部状态。
- 异步操作等待 Promise，失败保留输入并结束 pending，禁止重复提交；错误展示与 toast 不重复。
- 使用语义 Token，正常/错误/告警含义独立于品牌。允许业务映射状态，但不要在基础组件中写死业务设备枚举。
- 支持合理的 Light / Dark、密度与响应式。复杂表格在容器内横向滚动，不撑宽整页。提供标签、稳定 ID、键盘和可访问性语义。

## Preview 与注册

Preview 使用真实组件和静态数据，不调用真实 API，不复制简化组件，也不为了演示改动鉴权。示例标签说明数据范围；有交互的示例真正更新本地状态。展示多个示例时避免固定 id 冲突，尽量使用 useId。

创建后按照 [Design Playground 注册方法](../design-playground.md#component-registry新增公共组件) 加入 Component Registry，包含名称、分类、用途、组件名标签与 preview。新增分类应有真实条目。修改公共 API 时同步预览、文档和调用处，旧状态不能只靠更新截图掩盖。

官方组件安装后不机械创建同名公共包装或单独展示页；能在已有分类和预览组中表达用途与状态时优先补充现有示例。安装本身不等于必须公共导出或单独注册，新增项目公共业务组件仍须按上面的规则同步。

组件组合形成通用页面时，参考 [页面模板](../page-templates.md) 加入 Page Registry。页面内容、数据适配与外层 Layout 分开；Gallery 与业务使用同一视图组件，不长期保留独立的原型实现。

## 直接开发业务页面

在 containers 创建模块，按需接入路由、菜单、Redux、request 与现有错误处理。只需要本地状态时不创建全套 Redux。公开开发工具不代表业务页面也可公开，业务后台默认使用 needAuth:true，权限由后端执行。

检查真实调用链的成功、失败、空、加载与重复操作；无后端时明确 Mock 范围。公共组件关键交互按 [单元与组件测试](../unit-testing.md) 补充 RTL 测试；实际页面和 Gallery 按 [浏览器验证](../browser-verification.md) 检查相关交互、主题和响应式。最后按 [任务收尾检查](../development.md#任务收尾检查) 选择适用检查，不为静态小组件机械补齐所有测试，也不因为新增组件重做主题、请求层或工具链。
