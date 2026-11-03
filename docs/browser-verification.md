# 浏览器验证

项目使用 JavaScript 的 Playwright Test；配置为 `playwright.config.js` 和 `playwright.production.config.js`，不引入 TypeScript。现有 Node Test Runner 单元测试保持不变。当前仓库没有 CI 配置，本次仅提供本地能力。

## 安装和命令

```bash
npm ci
npm run test:e2e:install             # 安装与锁文件匹配的 Chromium
npm test                            # 原有 Node 设计/Mock 测试
npm run test:e2e                     # 桌面 Chromium + 手机触屏交互
npm run test:e2e:headed              # 桌面有界面运行
npm run test:e2e:ui                  # Playwright 自带调试界面
npm run test:e2e:visual:capture      # 只生成待人工确认的候选图，不比较、不建立基准
npm run test:e2e:visual              # 与已审核基准比较；没有基准时失败
npm run test:e2e:production          # 单独构建生产包并启动 preview 验证
npm run test:e2e:report              # 最近一次开发/视觉测试 HTML 报告
```

普通开发默认 3000，Mock 默认 3001。浏览器测试通过 webServer 自动运行 `dev:mock -- --port 3101 --strictPort`；生产测试单独运行 build + preview，端口 4175。测试不复用现有服务，端口冲突应停止占用该测试端口的服务，而不是连接未知实例；不需要另开开发服务。测试结束由 Playwright 停止自己启动的服务。

配置默认使用 Playwright 安装的 Chromium。如果操作系统不被新版 Chromium 支持，可在确实安装 Chrome 的机器上显式设置：

```bash
E2E_BROWSER_CHANNEL=chrome npm run test:e2e
E2E_BROWSER_CHANNEL=chrome npm run test:e2e:production
E2E_BROWSER_CHANNEL=chrome npm run test:e2e:visual:capture
```

本次集成所在机器为 macOS 12，官方 Chromium 下载不支持此系统，因此本机验证显式使用 Chrome；不能声称已验证下载版 Chromium。截图按 platform/channel 隔离，系统 Chrome 会自行更新，不能将其图片与其他环境的基准混用。团队建立基准时应固定操作系统、字体、锁文件和浏览器版本；受支持的环境优先使用下载版 Chromium。

## 测试范围与数据隔离

- `auth-forms.spec.js`：登录 / 修改密码的统一字段校验、原生气泡禁用、服务端失败保留输入、成功重置的固定错误行、字段及按钮位置不变，以及分页浮层、焦点与 Escape 交互；修改密码成功使用浏览器局部接口桩，避免改变共享 Mock 密码。
- `smoke.spec.js`：真实 Mock 登录、首页刷新、访客访问受保护路由、登录后返回原地址、错误提示。
- `playground.spec.js`：三种预设、浅深色、三种密度、配置面板、主色即时预览、恢复项目配置；列表正常/空状态；模板和组件库切换；手机竖横屏导航、日期弹层、更多操作、无整页横向溢出。
- `forms.spec.js`：RHF + Zod 表单校验、受控选择与日期、异步保存和失败反馈；分页整数 / 范围错误与跳转；桌面 / 手机、三种预设的浅深色及三个密度样例。详见 [表单开发](form-development.md)。
- `visual/playground.spec.js`：三个主题组合的通用列表页和 DataTable 组件示例。
- `production/app.spec.js`：生产 Playground 404、设计写入接口和 Mock API 不存在；首页、修改密码与鉴权保护仍正常。

每个测试使用独立 BrowserContext，不共享 Cookie、localStorage、IndexedDB 或预览草稿；Mock 由本轮测试专用进程启动，进程结束后重置。测试登录创建独立会话，fixture 在结束时删除该测试创建的 Mock 会话，不修改公共账号密码；页面列表操作仅存在于当前挂载实例。API 未完成时使用已有 Mock 明确路由，不伪装未知接口成功。当前列表模板的数据是页面本地示例，列表空状态验证不是后端分页协议验证。当前没有角色权限页，“无权限”验证的是访客不能进入受保护路由，不虚构 RBAC。

生产测试不启动 Mock，通过 Playwright 的 route 在测试浏览器中为既有登录和用户信息协议提供明确接口桩，既不修改生产构建，也不连接正式后端。这能验证产物路由/鉴权/UI，但不代表真实后端联调通过。测试不会点击“保存到项目”，也不会写入项目主题源码。

## 截图、日志和 Trace

失败截图、Trace、HTML/JSON 报告都在被 Git 忽略的 `artifacts/e2e/`：

- 开发和视觉：`dev/results/`、`dev/report/index.html`、`dev/results.json`。
- 视觉候选：`visual-candidates/results/`、`visual-candidates/report/index.html`，与交互测试报告分开存放。
- 生产：`production/results/`、`production/report/index.html`、`production/results.json`。
- 每个测试附带 `browser-log`，记录浏览器版本、console、请求失败和未捕获异常。未捕获 JavaScript 异常会使测试失败；预期的 API 错误可产生 console 网络日志，不能把所有 HTTP 错误都当渲染失败。

```bash
npx playwright show-trace "artifacts/e2e/dev/results/<失败用例目录>/trace.zip"
npx playwright show-report artifacts/e2e/production/report
```

Trace 中可查看操作、断言、DOM、网络和屏幕截图。无需额外安装录像编码器；本配置只保留失败截图和 Trace。报告及 results 代表最近一次运行，再次运行可能清理旧产物，需要留档时先复制到仓库外。

## 视觉基准审核

截图固定为 1440 × 1000、deviceScaleFactor 1、zh-CN、Asia/Shanghai、固定日期；视觉测试使用静态模板数据、等待本地字体和真实内容、关闭动画与过渡、隐藏输入光标。候选图通过 `artifacts/e2e/visual-candidates/report/index.html` 的附件查看。

1. 运行 capture，人工查看 Modern SaaS Light、Industrial Pro Dark、Creative AI Light 和 DataTable 四张候选图。
2. 未经人工确认，Agent 不得生成或替换 `tests/e2e/visual/baselines/` 下的图片。
3. 人工明确确认后，在相同环境下由开发者执行下面的首次基准命令，再审查 Git 图片 diff。显式指定 `missing` 只补齐缺失基准；已有基准变更需要另外审核。

   ```bash
   npx playwright test --project=visual --update-snapshots=missing
   ```

4. 之后执行 `test:e2e:visual`，使用 `toHaveScreenshot` 比较。配置中 `updateSnapshots: 'none'`，缺失基准或视觉差异都会失败；查看 actual / expected / diff 并调查原因。不能自动加大阈值、删除断言、skip 或更新截图掩盖问题。

备份源码中的设计配置变化可能有意改变截图，仍需人工确认视觉结果。本次仅提供候选截图，尚未批准基准，不能把候选生成成功描述为视觉回归通过。

## AI Agent 工作闭环

当前会话能通过终端调用 Playwright Test / Node 浏览器 API，无需另建浏览器控制服务或同时安装 MCP。其他 Agent 若可执行终端命令，也可以使用相同流程：

1. 阅读 AGENTS.md 与页面相关规范，确认路由和 Mock 数据。
2. 开发后运行对应测试；例如 `npx playwright test tests/e2e/playground.spec.js --project=chromium`，webServer 自动启动项目。
3. 使用 `--headed`、`--debug` 或 `test:e2e:ui` 交互定位；需要记录操作时另开 `npm run dev:mock` 后运行 `npx playwright codegen http://127.0.0.1:3001/design-playground`。本机 Chrome 可追加 `--channel=chrome`。
4. 必要时在测试中使用 `page.screenshot({ path: testInfo.outputPath('review.png') })` 并通过 testInfo.attach 加入报告。截图人工查看后继续检查 DOM、console、网络、URL 和交互，不能只凭像素图判断成功。
5. 读取报告和 Trace，修复项目代码或有依据的测试问题，再运行受影响测试，最后按需要运行完整 E2E 和生产验证。
6. 交付实际命令、测试环境、通过/失败数量、产物路径及未覆盖项。不能启动浏览器或下载浏览器时明确说明，不能把编译成功当浏览器验证通过。

常见新增业务测试可从 fixtures 导入 test / expect，再使用 helpers 的 login。关键交互优先采用角色、label、稳定业务 ID 定位；不要通过任意 sleep、坐标点击或削弱断言消除失败。现有 Mock 没有的数据协议应先明确补充 Mock 路由，避免创建与真实业务调用分离的另一套接口系统。

## 本次集成验证记录

环境：macOS 12、Playwright 1.64.1、本机 Chrome 150.0.7871.125（显式 channel=chrome）。

- `test:e2e`：12 项通过，包含桌面和手机。
- `test:e2e:production`：独立生产构建后 2 项通过。
- `test:e2e:visual:capture`：4 张候选图生成成功，未建立已审核基准。
- 验证“缺少基准”保护时，单独运行 Modern SaaS Light 比较得到预期的 1 项失败；失败截图与 Trace 保存在 `artifacts/e2e/visual-verification/results/`，未产生任何正式基准 PNG。这是保护验证，不是视觉回归通过。
- `npm test`：17 项设计/导航测试和 3 项 Mock 测试通过；ESLint、Stylelint、格式检查通过。

尚未验证下载版 Chromium、Firefox、WebKit、真实后端及角色授权；未配置 CI。人工确认视觉基准后还需执行正式截图比较。

配置与截图比较机制参考 [Playwright Web Server](https://playwright.dev/docs/test-webserver)、[Visual Comparisons](https://playwright.dev/docs/test-snapshots)、[Trace Viewer](https://playwright.dev/docs/trace-viewer)。
