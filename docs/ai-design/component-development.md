# Component Development

适用于公共组件、专业组件、页面内组件和直接业务开发，不要求先做图片或原型。共同规则见 [AI Design Guidelines](../ai-design-guidelines.md)，接口与 Redux 细节见 [业务开发指南](../development.md)。

## 判断组件层级

| 类型               | 位置 / 做法                                                    | Gallery 要求                               |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------ |
| 基础 UI            | `src/components/ui/`，优先 CLI 添加，沿用标准组合式 API        | 新增可复用基础能力补充对应预览组，覆盖状态 |
| 通用业务组件       | `src/components/<Name>/index.js`，从 components/index.js 导出  | 创建 Preview，加入 Component Registry      |
| 专业业务组件       | 已形成明确跨页面用途时放公共组件；仍依赖某业务模块时留在模块内 | 有稳定复用价值时提供隔离的 Preview 和分类  |
| 一次性页面内部组件 | `src/containers/<ModuleName>/` 内就近组织                      | 不强制注册，不为了 Gallery 强行公共化      |

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

组件组合形成通用页面时，参考 [页面模板](../page-templates.md) 加入 Page Registry。页面内容、数据适配与外层 Layout 分开；Gallery 与业务使用同一视图组件，不长期保留独立的原型实现。

## 直接开发业务页面

在 containers 创建模块，按需接入路由、菜单、Redux、request 与现有错误处理。只需要本地状态时不创建全套 Redux。公开开发工具不代表业务页面也可公开，业务后台默认使用 needAuth:true，权限由后端执行。

检查真实调用链的成功、失败、空、加载与重复操作；无后端时明确 Mock 范围。完成后验证实际页面与对应 Gallery 示例，并执行 ESLint、格式、适用的 Stylelint、注册检查和构建。不能因为新增一个业务组件而重做主题、请求层或工具链。
