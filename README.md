# react-boilerplate-ai-ready

面向 AI 协作开发的 React 管理后台脚手架，使用 Vite、shadcn/ui 和 Tailwind CSS，提供页面布局、路由、Redux 状态管理与请求鉴权封装。

GitHub 仓库：https://github.com/ihahoo/react-boilerplate-ai-ready

## 开始开发

使用 Node.js 22.12+（22.x）、24.x 或 26+ 与 npm，建议使用 Node.js 22 或 24 LTS。

```bash
npm ci
npm run dev
```

开发地址为 `http://127.0.0.1:3000`。首次启动前，请在 `src/config.js` 中配置应用标题及各环境的后端地址。`yourdomain.com` 相关地址为示例，需要替换为实际服务地址。

AI 开发总入口见 [AGENTS.md](AGENTS.md)。按任务选择规范，不要求先图片设计或先制作原型：

- [设计系统](docs/design-system.md)：Design Profile、Token、字体、状态与布局。
- [Design Playground](docs/design-playground.md)：设计配置、组件 / 页面注册与验证。
- [AI Design Guidelines](docs/ai-design-guidelines.md)：图片设计、原型、图片转代码、组件和业务开发四种独立能力。
- [页面模板](docs/page-templates.md)：当前模板用途和复用边界。
- [业务开发指南](docs/development.md)：路由、Redux、接口、表单与 Mock 详细示例。
- [shadcn 查询与可选工具](docs/shadcn-discovery.md)：官方文档、仓库及 CLI 查询；Skill / MCP 可选，不要求安装。
- [项目 Skills 使用与验证](docs/agent-skills.md)：页面与组件开发流程、Agent 发现检查和可选兼容方式。
- [单元与组件测试](docs/unit-testing.md)：Vitest、React Testing Library 与既有 Node 测试的分工和示例。
- [浏览器验证](docs/browser-verification.md)：Playwright、Mock E2E、视觉基准、报告和 Trace。

这些文档供任意 AI Agent 使用；工具未自动读取 AGENTS.md 时，可显式让其从该文件开始。

## 无后端开发

没有配置后端服务时运行：

```bash
npm run dev:mock
```

打开 `http://127.0.0.1:3001`，使用账号 **admin**、密码 **admin123** 登录。模拟模式使用开发端口加 1，与普通开发的浏览器登录缓存隔离；也可通过 `--port` 显式设置端口。

模拟接口包括登录、用户信息、token 刷新、退出和修改密码。请求仍经过项目的 request、Redux 与路由鉴权流程，可以直接调试控制台、布局和表单，无需启动后端或修改鉴权代码。

数据仅在开发服务内存中保存；修改密码会影响本次运行的后续登录，Vite 内部重载会保留会话和修改后的密码；停止并重新启动开发进程后密码恢复为 admin123，原有模拟会话失效。其他业务接口需要在 `vite/mock-api.mjs` 中按接口协议补充；未配置的 `/api` 请求返回明确的 404 JSON，不会转发到真实后端。

`npm run dev` 使用 `src/config.js` 的真实接口代理。模拟功能仅由 dev:mock 显式开启，不用于生产构建或 preview，也不会进入前端构建产物。

## 常用命令

```bash
npm run dev:mock        # 无后端开发，使用本地模拟接口
npm run dev             # 开发服务，支持 React Fast Refresh 和 CSS 热更新
npm run build           # 生产构建，输出 build/static
npm run build:staging   # 测试环境构建
npm run preview         # 本地预览构建产物
npm run clean           # 清理 build/static
npm run eslint          # 源码、Vite 配置和测试检查
npm run stylelint       # CSS 检查
npm test                # Vitest 与既有 Node 测试
npm run test:unit        # 纯逻辑单元测试
npm run test:components  # React 组件交互测试
npm run test:watch       # Vitest 监听模式
npm run test:e2e         # Playwright 桌面与手机验证
npm run test:e2e:production # 独立生产构建和浏览器检查
npm run test:mock       # 模拟接口和运行模式检查
npm run check:registry  # 组件 / 页面注册表检查
npm run test:design     # 设计系统与注册表测试
npm run format:check    # 格式检查
npm run format          # 格式化
```

## 多主题 Design System

本地开发时通过右上角调色板图标直接进入设计系统，也可打开 `/design-playground` 无需登录预览三种预设：Modern SaaS、Industrial Pro、Creative AI。支持浅色 / 深色、三种信息密度及 Standard Admin / Workspace / Monitoring 布局。调整先在预览会话中生效，点击“保存到项目”后写入项目默认配置和 Token 覆盖，供后续开发与生产构建使用。

页面顶层分为“页面模板”和“组件库”。页面模板包含通用列表页、Dashboard、工业监测、静态 AI 工作台；组件库提供基础与公共组件的真实交互示例。示例使用静态数据，不接业务数据接口或 AI 服务，全局顶栏支持恢复已有登录态。

可手动调整 Token 并即时预览，支持暂存、撤销、恢复项目配置、保存到项目、导出已保存 JSON、导入 JSON 到预览以及复制给 AI Agent。保存写入 `src/design-system/project-design.json` 与 `src/design-system/tokens/project.css`，不会自动 Git 提交；源码修改由 Vite 热更新展示。左侧菜单不放设计系统入口，生产构建不提供 Playground 路由、顶部入口或设计配置写入接口。主题、布局、组件 API 与协作规则见 [设计系统文档](docs/design-system.md)。

## 环境配置

`src/config.js` 集中管理应用配置：

- `host`、`hotLoadPort`：本地开发服务地址和端口。
- `app.title`：应用标题，用于 HTML 模板和页面标题。
- `environments`：`dev / staging / prod` 的接口地址及业务参数。

| 命令                    | Vite mode   | 应用环境 |
| ----------------------- | ----------- | -------- |
| `npm run dev`           | development | dev      |
| `npm run build:staging` | staging     | staging  |
| `npm run build`         | production  | prod     |

也可以通过 `STAGE=staging npm run build` 显式指定应用环境。配置修改后重启开发服务；环境配置在构建时确定，部署后修改进程环境变量不会改变已有产物。客户端配置会进入浏览器代码，不要放密钥。

开发环境的 `apiUrl` 为 `/api`。例如请求 `/api/authorizations` 时，Vite 会去掉 `/api` 前缀，转发到 `dev.proxyTarget` 对应的后端。staging 和 prod 使用各自的 `apiUrl`；直接跨域访问时，后端需要配置 CORS。

开发代理仅用于 `npm run dev`。生产部署如果使用相对 `/api` 地址，需要由部署服务器配置反向代理。

## 技术栈和目录

- React 19、React Router 7、JavaScript / JSX
- Redux 5、React Redux、Redux Thunk、Reselect、Immer、redux-act-reducer
- shadcn/ui、Radix UI、Lucide 图标、Sonner 消息提示
- Tailwind CSS 4、CSS Modules、PostCSS
- Vite、ESLint、Prettier、Stylelint
- Design Tokens、AppearanceProvider、布局与开发态 Design Playground
- Vite 开发 Mock：模拟现有鉴权接口，业务调用入口与真实接口一致
- Vitest、React Testing Library、user-event、jest-dom、jsdom：单元与组件测试
- Node Test Runner：既有设计配置、数据处理与 Mock HTTP 测试
- Playwright Test：页面交互、响应式、视觉比较与生产构建验证

```text
vite.config.mjs                       Vite 开发与构建配置
vitest.config.js                      Vitest 配置，复用 Vite 编译与别名
playwright.config.js                  Mock E2E、桌面/手机与视觉测试
playwright.production.config.js       独立生产构建和 preview 测试
vite/source-conventions.mjs           .js JSX 与 CSS Modules 文件处理
vite/mock-api.mjs                     开发模拟接口
vite/design-save.mjs                  开发态设计配置源码保存接口
components.json                      shadcn/ui CLI 配置
jsconfig.json                        编辑器路径别名与 JSX 配置
src/template/index.html              HTML 模板
src/index.js                         React 入口
src/config.js                        应用与环境配置
src/components/ui/                   shadcn/ui 基础组件
src/components/                      页面布局和公共业务组件
src/containers/                      登录、修改密码、控制台和业务模块
src/containers/DesignPlayground/      开发态页面模板、组件库与设计配置面板
src/design-system/appearance/        外观状态与主题应用
src/design-system/layouts/           标准后台、工作台和监测布局
src/design-system/tokens/            全局主题、密度及项目覆盖 CSS
src/design-system/project-design.json 已保存的默认外观、布局与 Token 覆盖
src/routes.js                        路由与登录保护
src/reducers.js                      Redux reducer 注册
src/utils/                           请求、鉴权、缓存、错误与跳转工具
src/utils/cn/index.js                 cn 样式合并工具
src/assets/css/main.css              Tailwind 入口与全局 Token 导入
tests/setup.js                      RTL 匹配器与测试状态清理
tests/unit/                         Vitest 纯逻辑测试（.test.js）
tests/components/                   RTL 组件交互测试（.test.jsx）
tests/*.test.mjs                    既有 Node 设计、数据与 Mock 测试
tests/e2e/                          Playwright 交互、生产与视觉测试
tests/e2e/visual/baselines/          仅存放人工确认的视觉基准
artifacts/e2e/                       生成的报告、截图和 Trace，Git 忽略
docs/                               设计、业务开发与测试文档
build/                               Express 静态服务与 Docker 发布文件
AGENTS.md                            AI 开发规范入口
```

`@/` 指向 `src/`，在 Vite 和 `jsconfig.json` 中配置。业务组件和普通逻辑使用 `.js`，支持 JSX；shadcn/ui 基础组件使用 CLI 生成的 `.jsx`。项目采用 JavaScript，不引入 TypeScript。

## UI 和样式

先检查项目公共组件和 Component Gallery，再查询缺失能力的官方文档、仓库或 CLI；官方 Skill / MCP 不是开发前提，也不会自动配置到用户环境。查询入口和示例见 [shadcn 查询与可选工具](docs/shadcn-discovery.md)。

优先组合 `src/components/ui/` 下的 shadcn/ui 组件。确认组件缺失且适用后按需添加：

```bash
npx shadcn@latest add dialog table select
```

`components.json` 的 `tsx: false` 指定生成 JavaScript 组件，生成文件使用 `.jsx` 后缀。

```jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<form onSubmit={handleSubmit}>
  <Label htmlFor="name">名称</Label>
  <Input id="name" name="name" required />
  <Button type="submit">保存</Button>
</form>;
```

表单使用原生 HTML 校验与显式业务校验。消息提示使用 Sonner 的 `toast.success()` / `toast.error()`，全局 `Toaster` 在 Root 中挂载。

日常样式优先使用 Tailwind，主题变量在 `src/design-system/tokens/` 中定义，由 `src/assets/css/main.css` 导入。业务 `.css` 默认启用 CSS Modules，可通过 `import styles from './styles.css'` 使用局部类名；全局选择器使用 `:global`。Tailwind 入口 `src/assets/css/main.css` 为全局样式，不启用 CSS Modules。PostCSS 支持 nesting、simple vars、mixins 和 Autoprefixer。

接入参考：[shadcn/ui Vite 安装文档](https://ui.shadcn.com/docs/installation/vite)、[Vite 文档](https://vite.dev/guide/)。

## 路由和数据

`src/routes.js` 中设置 `needAuth: true` 的路由由 `PrivateRoute` 校验 token。新增业务模块放在 `src/containers/<ModuleName>/`，按需创建 `actions.js`、`api.js`、`reducer.js`、`selectors.js`，并在 `src/reducers.js` 注册 reducer。

接口通过 `src/utils/api` 的 `request()` 发起，返回业务数据在 `res.body`。异步 action 使用 `createActionAsync`，reducer 处理 `REQUEST` / `SUCCESS` / `FAILURE`。错误用 `src/utils/error` 统一提取，在 effect 中展示。

## 模板和静态资源

HTML 模板位于 `src/template/index.html`，开发和构建共用。Vite 插件将它作为虚拟根入口加载，项目根目录无需创建 index.html。模板中的 `%APP_TITLE%` 根据应用配置替换，修改模板会触发浏览器刷新。

`<script type="module" src="/src/index.js"></script>` 声明 React 应用入口。构建时，Vite 会将其替换为带 hash 的 JS 产物链接，并生成独立 CSS 文件。

图片和字体使用 Vite 原生资源处理：小于 8 KiB 的资源可内联，较大资源输出为带 hash 的文件；ttf/eot 始终输出文件。

SVG 通过 `import logoUrl from './logo.svg'` 获取图片 URL，`?raw` 获取源字符串，CSS 中可使用 `url()`。通用界面图标使用 Lucide。

## 发布

`npm run build` 输出 `build/static`，可部署到支持 SPA 回退的静态服务器。非资源路由应回退到 `index.html`。

`build/server.js` 提供带 SPA 回退的 Express 静态服务，`build/Dockerfile` 用于容器部署。GitHub 部署流水线需根据项目的部署环境配置。

## 浏览器验证

使用 JavaScript 配置的 Playwright Test，支持独立 Mock E2E、桌面/手机交互、视觉候选和生产构建验证。

```bash
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:visual:capture
npm run test:e2e:production
```

视觉基准须人工确认，不能自动更新以消除失败。命令、浏览器环境要求、报告与 Trace、Agent 工作流程见 [浏览器验证](docs/browser-verification.md)。

## 单元与组件测试

```bash
npm test
npm run test:unit
npm run test:components
npm run test:watch
```

Vitest + React Testing Library 负责纯逻辑和公共组件交互，已有 Node 测试保持不变，页面与真实浏览器验证继续使用 Playwright。分工、配置与示例见 [单元与组件测试](docs/unit-testing.md)。
