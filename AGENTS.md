# Agent Project Notes

本文件是所有 AI Agent 的项目入口。先阅读相关文档，再检查目标模块与实际组件 API。保持已有业务流程与已确认的设计风格，不做无关重构。

## 按任务阅读

| 任务                               | 必须阅读                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| 新增或调整任何 UI                  | [设计系统](docs/design-system.md)、[AI 设计协作总说明](docs/ai-design-guidelines.md) |
| 调整主题、注册或验证示例           | [Design Playground](docs/design-playground.md)                                       |
| 生成设计图片 / 多方案              | [Image Design](docs/ai-design/image-design.md)                                       |
| 直接生成 HTML / React 原型         | [HTML / React Prototype](docs/ai-design/html-prototype.md)                           |
| 图片或截图还原代码                 | [Design to Code](docs/ai-design/design-to-code.md)                                   |
| 公共组件、专业组件、业务页面开发   | [Component Development](docs/ai-design/component-development.md)                     |
| 新增可复用页面模板                 | [页面模板](docs/page-templates.md)、Design Playground                                |
| 路由、Redux、API、表单或 Mock 联调 | [业务开发指南](docs/development.md) 中对应章节                                       |
| 工具逻辑或组件测试                 | [单元与组件测试](docs/unit-testing.md)                                               |
| 页面交互、响应式或截图验证         | [浏览器验证](docs/browser-verification.md)                                           |

用户可以直接要求图片、原型、图片转代码或业务开发，不强制先画图或先做原型。文档不绑定具体 Agent；不能假定其他工具自动读取 AGENTS.md，需要时引导其读取本文件。

## 技术和文件约定

- React 19、React Router 7、Redux 5、React Redux、Thunk、Reselect、Immer、redux-act-reducer；Vite、Tailwind CSS 4。
- 项目使用 JavaScript，不引入 TypeScript / TSX 或类型检查流程。业务文件即使有 JSX 也使用 `.js`；shadcn/ui CLI 源码使用官方 `.jsx`，不批量改名、格式化或无关重写。
- 优先 shadcn/ui，Lucide 图标，Sonner 通知；不引入 Ant Design 或另一套 UI 库。新增依赖需有明确用途。
- `src/containers/<ModuleName>/` 放业务页面，页面 default export；通过 `src/containers/index.js` 导出。
- `src/components/` 放公共业务组件，从 `src/components/index.js` 导出；`src/components/ui/` 从具体组件文件导入。
- 工具也使用目录，例如 `src/utils/cn/index.js`；`@/` 指向 src，模块内部用相对导入。
- 业务 `.css` 默认是 CSS Modules，不使用 `.module.css` 后缀。main.css 和 design-system/tokens 是全局 CSS，其他全局选择器用 `:global`。
- 新样式优先 Tailwind 和语义 Token。新增 UI 基础组件可运行 `npx shadcn@latest add <component>`。

## 设计与 Gallery

- 当前 Design Profile 以源码和用户确认结果为准；默认 Modern SaaS / Light / Default / Standard Admin。不要擅自改动项目整体风格。
- Preset、颜色模式、密度、布局互相独立；复用现有 AppearanceProvider / LayoutProvider，不创建第二套主题或配置系统。
- 用 bg-background、text-foreground、bg-card、border-border 等语义 Token；状态色不跟随品牌色改变含义。
- 优先组合 PageHeader、MetricCard、StatusIndicator、SearchToolbar、FilterBar、DataTable、ConfirmDialog、EmptyState、SectionHeader 等公共组件。
- 页面优先使用 StandardAdminLayout / WorkspaceLayout / MonitoringLayout，允许动态布局时使用 PageLayout。它们已含顶部与侧栏，不重复挂载。
- 新增可复用公共组件：编写 Preview，并加入 Component Registry；新增通用页面模板：编写独立预览，并加入 Page Registry。一次性页面内部组件不强制注册。
- 注册文件位于 `src/containers/DesignPlayground/gallery/`。不要把开发注册表导入正式组件或业务入口，避免生产打包设计工具。
- 设计系统仅开发环境可用，右上角图标直达，左侧不放设计菜单。生产不提供该路由、入口或外观选择界面。子菜单机制仍支持 children。
- 手动调整先影响 Playground 预览，明确点击“保存到项目”后才写入 project-design.json 和 tokens/project.css；保存不执行 Git 提交。AI 也可直接修改对应 Token / 组件源码，由 Vite HMR 展示效果；不集成 AI API、对话、图片服务或 Draft 数据库。

## 业务关键约束

- `src/routes.js` 使用 `{ path, component, needAuth }`；业务后台默认 needAuth:true。路由组件从 containers 统一导出，不用其他路由配置 API。
- 菜单配置在 `src/components/MainMenu/items.js`，分组使用 `{ key, label, icon, children }`，叶节点使用 to；根据 URL 选中，不传 Ant Design 菜单参数。
- Redux 只用于需要共享或异步管理的状态；本地交互用 Hooks。模块按需建 actions / api / reducer / selectors，在 src/reducers.js 注册。
- action type 加模块大写前缀；createAction / createActionAsync、createReducer 的 REQUEST / SUCCESS / FAILURE 与 Immer 用法见业务开发指南，不套用其他 Redux 库示例。
- API 通过 `@/utils/api` 的 request 调用，默认鉴权，公开接口才设 needAuth:false。成功数据在 res.body / action.res.body，失败在 action.err；错误用 `@/utils/error` 提取。
- dispatch 异步 action 返回的 Promise 不是业务 res.body，必须处理 reject。不重复弹通知，不在 render 中 toast；Root 已有全局 Toaster。
- 表单使用原生 form、Label 与 shadcn 输入，提供浏览器和业务校验、错误关联、加载和防重复提交。列表处理加载 / 失败 / 空数据、搜索与分页条件。
- 组件内通过 React Router 导航，组件外用 `@/utils/navigation`；不要整页刷新替代站内跳转。
- 登录、token 刷新、localforage 缓存、退出清理已有封装，常规业务不修改；权限仍需后端校验。
- 环境配置在 src/config.js；保留 dev / staging / prod。HTML 模板只放 src/template/index.html，不在根目录另建模板。客户端配置不能存密钥。
- 现有 moment、localforage 按现有封装使用，不因单次业务任务更换工具链、鉴权或基础依赖。

## 命令与交付验证

```bash
npm ci
npm run dev                 # 默认 3000，使用后端代理
npm run dev:mock             # 默认 3001，账号 admin / admin123
npm run eslint
npm run stylelint
npm run format:check
npm run check:registry       # 注册字段、ID、Preview 和布局检查
npm run test:design
npm run test:mock
npm run build               # build/static，生产需 SPA 回退
npm run build:staging
npm run preview
```

JS/React 改动执行 ESLint 和格式检查，CSS 改动执行 Stylelint；依赖、路由、全局配置变更执行生产构建。Gallery 注册改动执行 check:registry，主题变更执行 test:design，并在浏览器查看三预设浅深色、密度、1440 / 1024 / 390px、键盘和状态保持。真实接口与模拟接口的验证范围分开说明。

仅文档改动检查对应文档格式与链接。避免格式化无关文件；shadcn/ui 目录已排除。交付说明实际修改、验证和未覆盖内容；用户未授权时不提交、推送或部署。

## Browser Verification

浏览器配置与操作见 [浏览器验证](docs/browser-verification.md)。项目使用 JavaScript 的 Playwright Test，不添加 TypeScript。

- 新页面完成后实际在浏览器验证路由直达、布局、交互和 console 错误；关键交互在 `tests/e2e/` 添加 Playwright 测试。
- 主题、公共组件和响应式变更检查 Design Playground，至少覆盖桌面/手机、浅深色与相关预设密度。
- 无后端时复用现有 Mock；E2E 自动启动独立 3101 测试服务，不复用未知本地实例，不把模拟结果当真实后端验证。
- 运行 `npm run test:e2e`，涉及生产路由和开发能力隔离时另运行 `npm run test:e2e:production`。生产验证独立构建，不能用 dev 通过代替。
- 失败后读取截图、browser-log 和 Trace，调查原因；不得随意删除断言、skip、放宽视觉阈值或更新基准使测试通过。
- 视觉候选可通过 `test:e2e:visual:capture` 生成，基准图片必须人工确认；Agent 未获明确授权不得更新或补建基准。
- 测试产物位于 `artifacts/e2e/`，不提交日志、临时截图或 Trace。无法执行浏览器测试时，交付中说明原因和验证边界。

## 单元与组件测试

配置和示例见 [单元与组件测试](docs/unit-testing.md)。使用 JavaScript Vitest + React Testing Library；现有 Node 测试继续保留，Playwright 独立运行。

- 修改已有逻辑时按影响范围补充并运行测试；新增纯逻辑放 `tests/unit/*.test.js`，不要复制现有 Appearance/Mock 的 Node 测试。
- 新增可复用公共组件优先测试关键交互、pending、失败与重试，放 `tests/components/*.test.jsx`；业务源码仍按项目约定使用 `.js`。
- 不要求每个简单 UI 组件都有单元测试；测试优先验证用户可观察行为和公开输入输出，不依赖内部实现。
- 运行 `test:unit` / `test:components` 或 `test:vitest`；`npm test` 汇总 Vitest 与现有 Node 测试。新增业务页面仍优先通过 Playwright 进行页面验证。
- 测试失败先调查并修复，不能通过删除、skip 或随意削弱断言掩盖问题。API 未完成继续复用既有 Vite Mock，不另建 MSW 系统。
