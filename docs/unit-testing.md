# 单元与组件测试

项目使用 JavaScript 的 Vitest + React Testing Library，与 Node Test Runner 和 Playwright 分工协作，不替换现有 Vite Mock，也不引入 MSW、TypeScript 或覆盖率门槛。

## 测试分工

| 层级           | 位置                          | 负责                                                                                             |
| -------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Vitest 纯逻辑  | `tests/unit/*.test.js`        | 工具函数、业务规则、状态或权限判断、数据转换等快速验证                                           |
| Vitest + RTL   | `tests/components/*.test.jsx` | 自定义公共组件的可观察行为、交互、错误、空状态和异步反馈                                         |
| 现有 Node 测试 | `tests/*.test.mjs`            | 已有 Appearance、Mock、设计注册表、数据筛选与源码保存协议测试，继续保留                          |
| Playwright     | `tests/e2e/*.spec.js`         | 页面、登录、路由、Playground、真实浏览器、响应式和截图；见 [浏览器验证](browser-verification.md) |

新增逻辑测试优先放到 Vitest 目录；已有 Node 测试无需机械迁移，不为使用新框架重复编写 Appearance 和 Mock 测试。jsdom 不能验证真实 CSS 布局、媒体查询、浏览器绘制和截图，不能用组件测试通过替代 Playwright。

## 配置与命令

`vitest.config.js` 复用实际 Vite 配置中的路径别名、环境 define、PostCSS、sourceConventions 与 React 插件；排除 HTML 和设计源码写入插件，关闭 HMR，不启动开发端口。测试只收集 `tests/unit/**/*.test.js` 与 `tests/components/**/*.test.jsx`，不会误运行 Node 或 Playwright 用例。

组件测试使用 `.test.jsx` 表达测试中的 JSX；项目业务组件继续使用 `.js`，官方 shadcn/ui 文件保持 `.jsx`，不批量改名。纯逻辑测试使用 `.test.js`，全部是 JavaScript。

```bash
npm test                  # Vitest + 现有 Node 设计/导航 + Mock HTTP 测试
npm run test:vitest        # 一次执行全部 Vitest 测试（CI 可用）
npm run test:unit          # 仅纯逻辑测试
npm run test:components    # 仅 RTL 组件测试
npm run test:watch         # Vitest 交互式 watch，可带文件名筛选
npm run test:design        # 原有 Node 设计/数据测试
npm run test:mock          # 原有 Mock HTTP 测试，需要本地端口监听权限
npm run test:e2e           # 独立运行 Playwright，不包含在 npm test 中
```

本配置使用兼容项目既有 Node 22.12 / 24.0 要求的 jsdom 28，不因测试抬高项目的 Node 最低版本；显式导入 Vitest API，不依赖全局 describe/it/expect。`tests/setup.js` 提供 jest-dom 匹配器；每个测试结束后 cleanup DOM、清理 localStorage/sessionStorage、恢复真实定时器，配置自动清理 mock 调用记录和恢复 spy。不要无依据地添加 matchMedia、ResizeObserver 等全局假实现以掩盖浏览器问题，确有需要时按被测组件用途提供最小实现。当前 setup 为 Radix Switch / Popover Arrow 提供 jsdom 缺少的 ResizeObserver 空实现，仅支持组件挂载，不模拟布局或定位。

没有启用 HTTP 拦截器或全局 fetch mock。测试只使用已有纯函数、selector 和真实组件；表单中注入的回调可通过 vi.fn 控制成功、失败与 pending，不需要启动 Vite Mock。需要真实协议验证时继续运行现有 Mock HTTP 或 Playwright 测试。

## 示例

- `error.test.js`：业务错误优先级、原生 Error、字符串、HTTP 错误和缺失数据兜底。
- `auth-selectors.test.js`：按收到 token 的时间和有效秒数计算到期时间，缺失会话、字符串缓存字段和刷新后新状态。
- `SearchToolbar.test.jsx`：受控输入、输入草稿与提交分离、Enter/按钮提交、独立工具操作不误触搜索。
- `ValidationPopover.test.jsx`：聚焦显示、Escape / 外部关闭、再次提交重开、错误关联和输入 ref 保持。
- `ConfirmDialog.test.jsx`：取消不提交、异步 pending 期间禁用操作、防重复提交、成功关闭、失败保留并允许重试。
- 表单示例：`form-schema.test.js` 校验数字转换、缺失值、范围、日期与跨字段规则；`FormExample.test.jsx` 检查字段反馈、受控选择、回填 / reset、失败与重复提交；`Pagination.test.jsx` 检查跳转错误、最新范围和原有回调协议。实现与规则见 [表单开发](form-development.md)。

Appearance 和 Mock 数据处理已有 Node 测试；本次不为凑示例数量添加虚假业务模块，也不复制它们的断言。

## 编写方式

```jsx
import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchToolbar from '@/components/SearchToolbar';

it('用户点击搜索后提交', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<SearchToolbar value="项目" onChange={() => {}} onSubmit={submit} />);
  await user.click(screen.getByRole('button', { name: '搜索', exact: true }));
  expect(submit).toHaveBeenCalledOnce();
});
```

优先 getByRole/getByLabelText；等待可观察异步结果使用 findByRole/waitFor，不使用固定 sleep。测试应验证公开输入输出和用户行为，不绑定内部 state、私有方法或 Tailwind 类名，不为简单静态 UI 强行添加测试。不默认使用 DOM 快照。

修改逻辑时先判断现有测试是否覆盖，补充有价值的成功、失败、边界用例。新增可复用公共组件优先测试关键交互；新增业务页面优先通过 Playwright 验证路由、布局和流程。测试失败先调查源码、断言或运行环境的原因，不得删除断言、skip 或削弱预期来消除失败。

没有新增 CI 平台，后续可在现有命令基础上接入。若需要覆盖率或浏览器组件模式，等真实需求明确后再评估依赖，当前不预设目标百分比。

## 本次验证

- `test:unit`：2 个文件、4 项用例通过；`test:components`：2 个文件、5 项用例通过。
- 汇总命令 `npm test` 覆盖新增 Vitest 与原有 17 项设计/导航、3 项 Mock 测试。
- 已回归 Playwright 桌面/手机 12 项和独立生产验证 2 项；本机 macOS 12 继续显式使用 `E2E_BROWSER_CHANNEL=chrome`。
- 未建立或更改视觉基准，截图比较仍按既有人工审核流程进行；没有新增覆盖率报告、测试平台或 CI。
