# 项目 Skills 使用与验证

项目 Skill 只维护在 `.agents/skills/`。它们组织执行流程，设计规则仍以 [AGENTS.md](../AGENTS.md) 和按任务引用的 docs 为准，不依赖个人安装的 shadcn Skill 或 MCP。

## 选择与调用

| 用户任务                                     | 使用流程                                                              | Gallery 收尾                                 |
| -------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| 提取公共筛选组件、为公共组件增加重要变体     | [create-ui-component](../.agents/skills/create-ui-component/SKILL.md) | 公共导出、真实 Preview 与 Component Registry |
| 新增业务页面、工程化已确认原型、图片转页面   | [create-ui-page](../.agents/skills/create-ui-page/SKILL.md)           | 完成页面工程接入，不自动注册模板             |
| 新增可复用列表或工作区模板                   | create-ui-page 的模板分支                                             | 内容 Preview、Page Registry 和模板文档       |
| 改按钮文案、修正局部间距、页面内部一次性结构 | 按 AGENTS.md 和目标源码处理                                           | 不启动创建流程或机械注册                     |
| 只生成设计图片                               | 图片设计规范                                                          | 不使用这两个 Skill                           |

整页任务优先由页面流程组织，确实新增公共组件时才追加组件流程。先检查项目组件和 Gallery，再查缺失能力的官方 Registry 与组合示例；发现不足才自行实现。具体流程只在 Skill 与其引用规范中维护。

## Agent 发现与兼容

以下官方说明核对于 2026-11-03；本地会话验证与官方宣称的支持分开记录，具体版本和运行环境仍需使用者确认。

| Agent       | 官方目录支持                                       | 本次实际验证                                                                             |
| ----------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Codex       | 仓库 `.agents/skills/`，先读取元数据，按需加载正文 | 当前会话的可用 Skill 清单已列出两个名称、描述及项目路径；未另开 VS Code 会话测试自动选型 |
| Cursor      | 官方列出项目 `.agents/skills/`                     | 未实际运行 Cursor 验证，不需要先复制到 `.cursor/skills/`                                 |
| Claude Code | 项目 `.claude/skills/`；支持 Skill 目录符号链接    | 未启动 Claude Code 验证；本次不创建兼容链接或用户级配置                                  |

依据：[Codex 官方说明](https://learn.chatgpt.com/docs/build-skills)、[Cursor 官方说明](https://cursor.com/docs/skills)、[Claude Code 官方说明](https://code.claude.com/docs/en/skills)。这些结论针对所述本地项目入口，不保证所有云端 Agent、插件或版本都以同样方式加载。

### 在 Codex 中核对

从项目目录启动或打开 Codex，在 Skill 选择器（如输入 `$`）中查找两个名称。没有出现时重启会话，并确认工作目录、文件可读性及是否被本机 Skill 配置禁用；不直接覆盖个人配置。

可以先执行一个只读任务，区分“发现”和“执行”两个层次：

```text
使用 $create-ui-component，只读检查现有 ProgressBar 的公共导出、Gallery Preview 和测试范围，不修改文件。
```

再用实际开发任务观察是否按范围调用、同步必要 Gallery 并执行测试。看到名称只能证明可发现，不能证明自动触发和全过程执行正确；一次调用成功也不代表其他 Agent 已验证。

### Claude Code 的可选链接

需要原生发现时，可在仓库根目录执行以下命令。只建立项目链接，不复制正文，不修改个人配置；先检查同名路径，存在时停止核对，不覆盖。

```bash
mkdir -p .claude/skills
ln -s ../../.agents/skills/create-ui-component .claude/skills/create-ui-component
ln -s ../../.agents/skills/create-ui-page .claude/skills/create-ui-page
```

这些是可选操作，本次未执行。新会话中通过技能命令列表检查，再只读调用 `/create-ui-component` 或 `/create-ui-page`。符号链接依赖操作系统与 Git 检出方式；Windows 或受限环境应先确认链接可读，不通过维护两份独立正文解决兼容问题。支持多个目录的工具可能显示重复入口，检查后再决定是否启用链接。

不支持发现或符号链接时，直接要求 Agent：“先读取 AGENTS.md，再读取 `.agents/skills/create-ui-page/SKILL.md`，按本次任务选择相关规范。”这仍可执行流程，但不等同于原生 Skill 自动发现。

## 现有流程核对

本次使用现有资产核对流程，不为了验证而创建正式业务组件或模板。

| 对象         | 源码与工程接入                                                                                            | 流程核对结果                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| DatePicker   | `src/components/DatePicker/index.js`，由 `src/components/index.js` 导出                                   | 已组合 shadcn Calendar + Popover；Component Registry 的 `date-picker` 指向真实 DatePickerPreview，无需重新实现或迁移 |
| ProgressBar  | `src/components/ProgressBar/index.js`，由 `src/components/index.js` 导出                                  | 已包装官方 Progress；`progress-bar` 对应 ProgressPreview，包含可调、零值、完成和不确定进度                           |
| 通用列表模板 | Page Registry 的 `list` → `gallery/previews/PagePreviews.js` 的 ListPagePreview                           | 在既有 Playground 外层布局下预览；属于 Page Gallery 分支，不额外创建正式业务路由                                     |
| 修改密码页   | `src/containers/Auth/ChangePassword/index.js`、containers 统一导出、`src/routes.js` 的 `/change-password` | `needAuth: true`，属于业务页面；不因使用公共组件而纳入 Page Gallery                                                  |

Component / Page Registry 均位于 `src/containers/DesignPlayground/gallery/`。注册检查只校验已有条目，不能发现遗漏资产；仍需逐项对应公共导出与 Preview，并实际打开页面。以上是基于现有代码和测试的流程核对，不是让其他 Agent 独立完成新功能的行为评测。

## 本次验证边界

- 两个 Skill 通过 `skill-creator` 的 Frontmatter、名称与脚手架占位校验；另检查本地文档链接、锚点和引用 npm 命令。
- `npm run check:registry`：3 项通过；`npm run test:components`：5 项通过；`E2E_BROWSER_CHANNEL=chrome npm run test:e2e`：14 项通过（12 项既有测试 + 2 项临时 Gallery 核对，无跳过、失败或重试）。
- 浏览器流程覆盖 Mock 登录、受保护页直达与刷新、列表正常与空数据、三种主题、颜色模式与密度、移动端导航与弹窗，并临时核对 DatePicker / ProgressBar 的 Gallery 交互。临时核对文件执行后删除，截图及日志保留在被 Git 忽略的 `artifacts/e2e/dev/`。
- 本机 Node 22.22.2、macOS 12.7.6，显式使用已安装的 Chrome；不宣称验证过下载版 Chromium。报告和 Trace 查看方式见 [浏览器验证](browser-verification.md)。
- 本次只改说明文档，未修改业务代码、依赖、路由或生产配置，因此未重跑生产构建、生产 E2E 或视觉基准比较；不声称生产或视觉回归验证通过。没有新增简单静态组件测试，也不擅自更新基准截图。
