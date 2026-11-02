# 页面模板

Page Gallery 展示有复用价值的完整页面内容，而非所有业务路由。进入开发服务的 `/design-playground`，通过对应页签或 `?view=<id>` 查看。设计配置面板继续适用于所有模板。

## 当前模板

| ID / 页面                  | 适用场景                       | 推荐 Layout    | 数据与交互                                                              |
| -------------------------- | ------------------------------ | -------------- | ----------------------------------------------------------------------- |
| data / Dashboard、数据管理 | 项目、用户、资源等管理列表     | standard-admin | 固定指标、搜索 / 状态过滤、排序分页、本地新增编辑、归档确认、空状态     |
| monitoring / 工业监测      | 设备运维、采集监测、运行状态   | monitoring     | 固定设备列表、带单位 / 阈值 / 图例的 SVG 趋势、告警；刷新只更新本地示例 |
| workspace / AI 工作台      | 知识工作区、任务结果与资源组织 | workspace      | 静态内容、结果清单和工具 / 资源面板，不连接 AI、不提供对话能力          |

三个模板分别复用现有 DataManagement.js、Monitoring.js、Workspace.js，`gallery/previews/PagePreviews.js` 只适配布局上下文。它们是设计参考，尚不是特定业务的后端、权限或数据协议实现。

## 使用模板开发

选择与场景相符的信息架构，复用对应公共组件及同一内容实现；不要机械保留示例文案、业务状态、固定日期或统计数字。正式页面采用已有固定 Layout，配套真实 API / Redux / 权限；视图与数据适配分离，让需要的示例继续能用静态数据预览。

PageGallery 外层已经使用 PageLayout，Preview 不再挂载顶部栏与侧栏。推荐 layout 是元数据，不会强制修改独立的用户布局选择。正式页面自带 Layout 时，提取可共享的内容组件供双方引用，不嵌套两套 Shell。

## 新增模板

新增 Dashboard、Detail Page、Form Page、Analytics 等模板时，先确定可复用价值；不预建没有实现的分类。

创建内容组件与静态 Preview，在 page-registry.js 注册 id、name、category、description、tags、layout、preview，再在本文表格中记录用途、状态与数据范围。完整代码示例和命令见 [Page Registry 注册方法](design-playground.md#page-registry新增通用页面模板)。组件层面的资产同步见 [Component Development](ai-design/component-development.md)。

验证独立深链、真实交互、切换布局时不重复导航、浅深色、密度、响应式与生产隔离。生产组件不能反向导入开发注册表；普通业务页面无需注册。
