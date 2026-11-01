# react-boilerplate-ai-ready

面向 AI 协作开发的 React 管理后台脚手架，使用 Vite、shadcn/ui 和 Tailwind CSS，提供页面布局、路由、Redux 状态管理与请求鉴权封装。

GitHub 仓库：https://github.com/ihahoo/react-boilerplate-ai-ready

## 开始开发

使用 Node.js 22.12+（建议 Node.js 22 LTS）与 npm。

```bash
npm ci
npm run dev
```

开发地址为 `http://127.0.0.1:3000`。首次启动前，请在 `src/config.js` 中配置应用标题及各环境的后端地址。`yourdomain.com` 相关地址为示例，需要替换为实际服务地址。

AI 开发约定见 [AGENTS.md](AGENTS.md)。

## 常用命令

```bash
npm run dev             # 开发服务，支持 React Fast Refresh 和 CSS 热更新
npm run build           # 生产构建，输出 build/static
npm run build:staging   # 测试环境构建
npm run preview         # 本地预览构建产物
npm run clean           # 清理 build/static
npm run eslint          # JS / JSX 检查
npm run stylelint       # CSS 检查
npm run format:check    # 格式检查
npm run format          # 格式化
```

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

```text
vite.config.mjs             Vite 开发与构建配置
vite/source-conventions.mjs  JSX 与 CSS Modules 文件处理
components.json             shadcn/ui CLI 配置
jsconfig.json               编辑器路径别名与 JSX 配置
src/template/index.html     HTML 模板
src/index.js                React 入口
src/config.js               应用与环境配置
src/components/ui/          shadcn/ui 基础组件
src/components/             页面布局和业务通用组件
src/containers/             登录、修改密码、控制台和样例模块
src/routes.js               路由与登录保护
src/reducers.js              Redux reducer 注册
src/utils/                  请求、鉴权、缓存、错误处理和跳转工具
src/utils/cn/index.js        cn 样式合并工具
src/assets/css/main.css      Tailwind 入口和主题变量
build/                      Express 静态服务与 Docker 发布文件
AGENTS.md                   AI 开发约定
```

`@/` 指向 `src/`，在 Vite 和 `jsconfig.json` 中配置。业务组件和普通逻辑使用 `.js`，支持 JSX；shadcn/ui 基础组件使用 CLI 生成的 `.jsx`。项目采用 JavaScript，不引入 TypeScript。

## UI 和样式

优先组合 `src/components/ui/` 下的 shadcn/ui 组件。添加组件：

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

日常样式优先使用 Tailwind，主题变量在 `src/assets/css/main.css` 中定义。业务 `.css` 默认启用 CSS Modules，可通过 `import styles from './styles.css'` 使用局部类名；全局选择器使用 `:global`。Tailwind 入口 `src/assets/css/main.css` 为全局样式，不启用 CSS Modules。PostCSS 支持 nesting、simple vars、mixins 和 Autoprefixer。

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
