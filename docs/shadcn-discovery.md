# shadcn/ui 组件发现与可选工具

本项目面向不同 AI Coding Agent。必须执行的是 [组件发现与选型](ai-design/component-development.md#组件发现与选型)，不是安装某款 Agent 工具。官方 Skill、MCP、CLI 和浏览工具均是可选择的查询方式，不能成为运行脚手架或开发页面的强制前提。

## 没有 Skill 或 MCP 时

1. 先看项目公共组件、`src/components/ui/` 和 Component Gallery，确认源码、API 和已有定制。
2. 对缺失能力或不确定的组合，使用当前 Agent 已有的网页读取、终端或仓库搜索能力查询下面的官方入口。不必为了查询先安装 Skill、接入 MCP 或克隆整个仓库。
3. 查到候选后比较实际需求和项目配置，选择直接复用、组合封装或有理由的自行实现。新页面批量盘点所需组件，避免逐个重复查询。
4. 仅在确实需要新增项目组件时通过官方 CLI 按需添加；添加组件会修改项目文件与依赖，与安装 Agent 的 Skill / MCP 不是同一件事。
5. 没有网络或可用查询工具时，先使用已确认的项目能力并明确未核实部分；不要把“当前无法查询”写成“官方没有”，也不要因此直接重复实现成熟基础控件。关键缺口需说明后再确定实现方案。

| 官方入口                                             | 用途                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| [组件文档](https://ui.shadcn.com/docs/components)    | 查功能、API、交互和组合示例；当前项目优先看 Radix 分支               |
| [GitHub 仓库](https://github.com/shadcn-ui/ui)       | 查官方实现、依赖与示例；按组件名和基础实现搜索，不混抄其他体系的源码 |
| [Registry 文档](https://ui.shadcn.com/docs/registry) | 理解可安装组件、依赖与命名空间，和项目 Gallery 分开                  |
| [CLI 文档](https://ui.shadcn.com/docs/cli)           | 查询、查看组件内容及按需添加                                         |
| [官方 Skill 文档](https://ui.shadcn.com/docs/skills) | 可选的 shadcn 项目上下文与开发流程知识                               |
| [官方 MCP 文档](https://ui.shadcn.com/docs/mcp)      | 可选的组件 Registry 查询和工具调用能力                               |

GitHub 源码或官网示例可能是 TypeScript / Next.js；它们是参考，不是修改本项目技术栈、目录或基础库的理由。不要把官方 Registry 或 MCP 查询结果当作本项目已经安装或已注册的组件。

## CLI 查询示例

以下示例来自官方 CLI 文档，在项目根目录按实际需要选择执行。`search` 查候选、`view` 查看 Registry 条目、`docs` 获取文档；查询不等于把组件加入项目。npx 首次运行可能需要下载 CLI 到 npm 缓存，不要求全局安装，也不会因此安装官方 Skill 或配置 MCP。

```bash
npx shadcn@latest info --json
npx shadcn@latest search @shadcn -q "calendar"
npx shadcn@latest view calendar popover progress
npx shadcn@latest docs calendar --base radix
```

执行前可用 `npx shadcn@latest --help` 核对当前版本支持的命令。工具输出的基础库信息必须与 `components.json` 和已有组件的实际依赖交叉核对，不能为了让探测成功而重跑 init、迁移基础库或覆盖配置。

确认适用、检查同名文件和依赖后，才选择添加确实缺少的组件，例如 `npx shadcn@latest add calendar`。若该组件已经存在，不重复安装，更不能盲目覆盖；本项目已有 Calendar、Popover、Progress。不使用批量安装所有组件或覆盖定制文件的方式完成发现步骤。

## Skill 和 MCP 是可选增强

| 当前能力                | Agent 的处理方式                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| 已有可用官方 Skill      | 按当前 Agent 的发现方式读取，辅助选型；项目 JavaScript、Tokens 和 Gallery 规范仍适用      |
| 已有已连接的 shadcn MCP | 可用于查询 Registry；确认工具调用实际成功，再声称查询成功，不能以配置文件存在代替连接验证 |
| 没有 Skill 或 MCP       | 直接使用官方文档、仓库或 CLI；继续开发，不强制安装                                        |
| 有配置但工具不可用      | 说明限制并切换通用查询方式，不擅自修复用户环境或反复安装                                  |
| 用户明确希望接入        | 根据当前 Agent 的官方配置方式，先确认已有配置及安装范围，再进行最小合并和实际验证         |

安装范围必须区分：本项目共享的源码和规范、Agent 可发现的项目级 Skill、用户自己的工具安装与配置。官方 Skill 的安装位置和 MCP 的配置作用域取决于工具及所选方式，不能假定所有 Agent 使用相同目录或都支持自动发现。

不在项目初始化、npm scripts、测试或普通页面开发时自动安装 Skill / MCP；不覆盖用户级配置，不提交个人设置或凭据。用户希望接入时，按上面的官方指南和当前客户端能力分别处理，不能把某人的本机配置当成整个脚手架已经具备的能力。项目核心规则始终可从 AGENTS.md 和 docs 读取，不能只藏在某个 Skill 内。

## 当前项目的兼容边界

- `components.json`：`style: new-york`、`rsc: false`、`tsx: false`；样式入口是 `src/assets/css/main.css`。
- 基础组件位于 `src/components/ui/`，生成文件使用 `.jsx`；公共业务组件使用 `.js`。
- 别名沿用 `@/components`、`@/components/ui`、`@/utils/cn`；实际基础组件可能使用生成时的 `cn` 包导入，不为统一形式批量重写。
- 已有基础实现采用 Radix UI，例如 Progress 从 `radix-ui` 导入；Calendar 使用 React DayPicker。不因为新工具或官网默认值不同就混入 Base UI / React Aria 组件。
- 安装或更新前检查已有源码、必要依赖和定制；工具接入本身不要求改配置、换基础实现或重构脚手架。

## 通用列表页的源码核对

下表是本次对 `src/containers/DesignPlayground/ListPage/` 及相关组件的静态核对，不是新的浏览器测试或全面组件审计；实现变化后需重新检查。

| 对象                       | 当前实现                                                          | 建议与风险                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DatePicker                 | 复用 Calendar + Popover，补充中文、字符串日期协议、清空和范围限制 | 已采用 [官方组合](https://ui.shadcn.com/docs/components/radix/date-picker)，无需迁移；替换包装会影响筛选和编辑表单的日期协议                                             |
| ProgressBar                | 复用官方 Progress，补充数值归一化、百分比和不确定状态             | 已复用 [官方 Progress](https://ui.shadcn.com/docs/components/radix/progress)；只需轨道时可直接使用基础组件，现有场景不必拆掉包装                                         |
| DataTable                  | 组合 shadcn Table 与 Button，提供受控排序、列渲染和空 / 加载状态  | 官方也提供 [Table + TanStack Table 组合指南](https://ui.shadcn.com/docs/components/radix/data-table)；按真正的复杂交互缺口评估，当前不为了统一工具而引入依赖或替换列 API |
| Pagination / ConfirmDialog | 分别组合官方 Pagination / AlertDialog 及现有基础组件              | 承载分页协议和异步确认行为，不属于未复用官方能力而重造基础组件；替换需验证调用方行为                                                                                     |
| 选择、弹窗与行操作         | 直接使用现有 Select、Checkbox、Dialog 和 DropdownMenu 等          | 本次查看的范围内未发现需要立即重写的重复基础实现；原生 HTML 组合和页面业务逻辑不因存在官方组件就必须全部替换                                                             |

新增组件仍按 [组件层级](ai-design/component-development.md#判断组件层级) 判断公共导出、Preview、注册和测试，不为每个官方基础文件机械新建展示页。发现机制不是迁移计划，也不保证任意官方示例可直接覆盖本地代码。

## 本轮验证边界

已通过网页读取实际访问官方文档与 GitHub 仓库，并核对上述 CLI 查询语法及本地组件配置、依赖和组合关系。本轮没有执行 CLI 查询或安装命令，没有安装官方 Skill、配置或连接 MCP，没有读取或修改本机 Agent 用户级配置。不能把官方页面可访问描述成 CLI / MCP 已连接，也不能保证其他 Agent 在没有网络时能执行同样查询。
