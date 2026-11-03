# 表单开发、校验与反馈

复杂业务表单推荐 React Hook Form（RHF）+ Zod + `@hookform/resolvers/zod`。简单搜索、分页跳转、独立开关不强制使用 RHF；已有简单原生表单不批量迁移。业务源码继续使用 JavaScript `.js`，官方 shadcn 基础组件使用 `.jsx`。

## 从现有实现开始

先检查项目组件、Component Gallery 和 [shadcn 官方表单指南](https://ui.shadcn.com/docs/forms/react-hook-form)，缺失能力再按 [组件发现规则](shadcn-discovery.md) 查询并按需添加。沿用 Radix 实现，不复制过时 Form.Item 或旧 FormField API。

- 校验气泡：从 `@/components` 导入 ValidationPopover，组合现有 shadcn Popover + FieldError；分页跳转使用浮层；登录、修改密码和完整表单示例默认使用下方的固定错误位置。
- 基础字段：`src/components/ui/field.jsx` 的 Field、FieldLabel、FieldDescription、FieldError、FieldGroup；直接从文件导入，不另建错误展示框架。
- 日期：项目 DatePicker（Calendar + Popover），使用本地日期 `YYYY-MM-DD` 字符串。
- 完整示例：`src/containers/DesignPlayground/gallery/previews/FormExample/`，包含 `index.js`、`schema.js`、`mock.js`。
- 登录与修改密码已接入 RHF + Zod，校验规则位于 `src/containers/Auth/schema.js`；保留原有 Redux、请求与 Sonner 结果反馈，不再使用原生校验气泡。密码不 trim，登录不增加新密码的长度要求。
- 本地访问：`npm run dev:mock` 后打开 `/design-playground?view=components`，搜索 Form，在“表单组合”中体验回填、重置、禁用、提交结果及主题配置。示例本地异步函数不连接 API，也不是新的 Mock 子系统。

## RHF 初始化与控件接入

```js
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', quantity: '', category: '', enabled: false },
  mode: 'onSubmit',
  reValidateMode: 'onChange'
});
```

首次提交前按提交校验，提交后修改有错误的字段时重新校验。需要更早提示可按业务选择 onBlur / onTouched；避免一进入页面就显示全部错误。跨字段规则在 schema 中实现，并指定错误应落到哪个字段；涉及其他字段的实时联动确有需要时调用 `trigger`，不要假定修改关联字段就一定会重新校验所有错误。

- `defaultValues` 给出完整、稳定的输入初值，受控字段避免 undefined；默认值会缓存，不依赖重新渲染自动回填。
- 原生 Input / Textarea 优先 `{...form.register('name')}`；不再同时传冲突的 value / onChange。
- Select 使用 Controller：Root 接收 `value`、`onValueChange`、name；Trigger 接收 `ref`、`onBlur`、id 和错误 aria 属性。
- DatePicker 使用 Controller 的 value / onChange / name / onBlur / ref，遵守项目的日期字符串协议；Switch 使用 checked / onCheckedChange，Checkbox 使用 checked / onCheckedChange 并按业务明确是否允许 indeterminate。
- Controller 已注册字段，不再 register 同名字段；ref 应落在可聚焦控件上，便于错误定位。
- `form.handleSubmit(onValid)` 接收 schema 转换后的数据。onValid 返回实际异步 Promise，不能发起请求后立即返回；读取 `form.formState.isSubmitting` 禁用提交并显示保存中。对可能重入的事件额外使用局部同步锁，不只依赖按钮 disabled。
- 请求成功后再反馈成功，并按需求 `reset(savedValues)` 建立新的编辑基线；失败保留输入、结束 pending，处理 reject。真实接口使用既有 request / Redux，不在业务表单直接 fetch 或另读 token。

### 编辑、重置与动态字段

异步详情到达后执行 `reset(record)`，同时更新控件和默认基线；`reset()` 撤销到当前基线，`reset(emptyValues)` 开始新建。加载期间显示状态并避免提交、重置或切换记录相互覆盖；实际多记录请求应取消旧请求或使用序列检查。不要在每次 render 或无条件 effect 中 reset，覆盖用户输入。

只禁用交互时可用 fieldset，并为受控控件显式传 disabled。若通过 RHF 的 disabled 选项禁用字段，其值可能不参与提交；需要保留的只读值应明确建模，不假定所有禁用策略都相同。

动态字段按需使用 `useFieldArray({ control: form.control, name: 'contacts' })`，通过 `append({ email: '' })` / `remove(index)` 操作，渲染 key 使用 `field.id`，注册名为 `contacts.${index}.email`；schema 同步定义数组与元素约束。条件卸载字段是否保留值用 shouldUnregister 明确选择，不构建通用动态表单引擎。

## Zod 数据与业务规则

- 字符串使用 trim、min / max 表达必填和长度；枚举用 `z.enum`，布尔用 `z.boolean`，不把 `'false'` 通过 Boolean 转成 true。
- 数量区分输入值与提交值。HTML 数字输入通常给出字符串，`valueAsNumber` 的空值可能是 NaN；不要把 `''`、空白、null 或 undefined 转成 0。
- 在 schema 的 `z.preprocess` 中只转换明确支持的输入类型，再交给 `z.number().int().min().max()`。NaN、非数字字符串、布尔值和数组必须失败。可选数字应将缺失值归一成 undefined 后交给 optional，而不是以 0 代替缺失。
- 日期用 `z.iso.date` 校验真实日历日期；DatePicker 已返回日期字符串。时间点另按 API 确认时区和 datetime 协议，不把本地日期盲目转 UTC。
- 使用 refine / superRefine 表达业务规则和跨字段约束，例如结束日期不早于开始日期、团队数量至少 2；设置 path 指向应显示错误的字段。
- 业务提交只发送通过校验的转换结果，不发 input 草稿；前端校验不能代替后端校验。

示例的数字预处理先把空字符串和 null 归一为 undefined，再转换非空数字字符串。实际代码与边界测试见示例 `schema.js` 和 `tests/unit/form-schema.test.js`，不要直接对所有值使用 `z.coerce.number()`。

## 字段错误与无障碍

```jsx
<Field className="gap-2">
  <FieldLabel htmlFor={id}>名称</FieldLabel>
  <div className="space-y-1">
    <Input {...form.register('name')} id={id} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-error` : undefined} />
    <div className="min-h-4">
      <FieldError id={`${id}-error`} className="text-xs leading-4" errors={[errors.name]} />
    </div>
  </div>
</Field>
```

普通表单默认在输入框下预留一行错误区域，未出错时保持空白，出错时就地显示，避免字段和按钮上下跳动。默认标签到输入框 8px、输入框到错误行 4px、错误行高 16px；登录和修改密码的字段间隔 12px，提交区再增加 4px。不要再叠加大块 padding 或空白容器；多行长错误允许自然增高，不裁剪内容。

每个实例使用 useId 或唯一前缀，label 指向实际输入或 Trigger；描述和错误通过 aria-describedby 关联，必填可使用 aria-required。FieldError 自带 alert 语义及 destructive 语义色，标签保持正常文字颜色；不以 Tooltip 代替字段错误，也不对每个错误弹 Toast。使用现有 Token 支持三套预设、浅深色和密度，不写死品牌错误颜色。分页等不适合增加高度的工具栏使用下述校验气泡，公共气泡组件及其 Gallery 示例继续可用。

采用统一字段错误的表单使用 `<form noValidate>`，校验由 schema / 局部逻辑负责，避免浏览器气泡阻断提交事件。可以保留 type、inputMode 等输入语义与键盘提示，但 noValidate 不会把无效输入自动转成正确值。不要全局禁用浏览器校验；简单原生表单仍可使用 required、min、max、pattern，不在同一流程重复展示原生气泡和自定义错误。

### 不占布局的校验气泡

children 为单个可聚焦控件；保留 register 的 ref、事件和辅助说明，自动关联错误描述与 aria-invalid。`message` 为错误文字，`attempt` 每次提交递增，`errorId` 可指定已有错误 ID，`className` 调整锚点容器宽度。`submitCount` 可直接作为 RHF 的 attempt；简单局部表单自行递增计数，不必接入 RHF。

校验失败后由表单聚焦首个错误控件，默认在输入框上方靠右显示；气泡只展示当前聚焦字段；Escape 或点击外部关闭，重新聚焦或再次提交可重新打开。修正错误后关闭；关闭时错误边框和屏幕阅读器关联仍然保留。外层布局没有错误占位；使用 Portal、主题语义色和 Radix 碰撞避让，气泡不抢输入焦点，也不截获底下控件的点击。它是校验反馈，不依赖鼠标 hover，不用 Tooltip 代替。

Component Gallery 中搜索“校验气泡”可操作真实示例；不需要安装新依赖或重写基础定位组件。来源：[shadcn Popover](https://ui.shadcn.com/docs/components/radix/popover)、[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover)。

### 服务器错误

根据已约定的 API 协议提取字段错误，映射已知字段，例如：

```js
form.setError('name', { type: 'server', message: '名称已存在' }, { shouldFocus: true });
form.setError('root.server', { message: '保存失败，请重试' });
```

服务器字段错误放到对应 FieldError；未知字段或整体错误放在表单级 Alert 或单次 toast.error，不能静默吞掉。不要将任意服务端字段名直接当作可信表单路径。示例接口只约定 name 字段；真实业务按契约建立允许的字段映射。若请求期间禁用了字段，应在恢复可用后再聚焦服务器指出的字段，让用户定位对应字段。重新提交或 reset 时清理过期错误；不要在 catch 和 Redux 错误 effect 中重复通知。

## 操作反馈和辅助说明

Root 已有唯一 Toaster，随现有 AppearanceProvider 传入浅深色，并使用主题表面变量。页面不再挂载 Toaster，不引入第二套通知工具。

| 类型                        | 用途                                    |
| --------------------------- | --------------------------------------- |
| `toast.success`             | 实际保存、修改、删除成功                |
| `toast.error`               | 请求、网络或整体操作失败                |
| `toast.warning`             | 需要注意但不阻断操作的警告              |
| `toast.info`                | 一般信息，例如示例数据载入              |
| Alert                       | 需要持续阅读的表单整体错误或说明        |
| AlertDialog / ConfirmDialog | 需要明确确认的操作，不用 Toast 代替确认 |

从 `sonner` 导入 toast，在事件或 effect 中触发；不要 render 中触发。字段错误就近显示；同一整体错误选择 Toast 或 Alert，不重复通知。示例保存失败使用持续 Alert、载入失败使用 toast.error、保存成功使用 toast.success。

Tooltip 复用 `src/components/ui/tooltip.jsx` 和 Root 的 TooltipProvider，用于图标按钮、简短说明或缩略内容。Trigger 可键盘聚焦并有 aria-label；重要规则同时出现在 FieldDescription 或其他可见说明中，触屏不依赖 hover。Tooltip 不是普通表单错误的主要入口。

## 分页跳转

紧凑工具栏使用 ValidationPopover 浮层提示，标签保持正常文字颜色；错误不增加分页栏高度。

`src/components/Pagination/index.js` 使用局部状态和 ValidationPopover（内部复用官方 FieldError），不引入 RHF。跳转表单 noValidate，输入使用 text + inputMode=numeric；提交时按最新总页数验证十进制整数、安全数值及 1～总页数范围。非法输入保留草稿并显示关联错误，不调用 onChange；合法输入通过原有 `(page, perPage)` 回调跳转；实际翻页后重置跳转草稿，不在返回旧页时恢复无效输入。Enter 和按钮使用同一提交逻辑；零条数据仍按现有约定显示第 1 页，不改变外部 API。

## 测试与交付

- 单元：`tests/unit/form-schema.test.js` 覆盖空值、NaN、转换、长度、范围、枚举、日期与跨字段规则。
- 组件：`tests/components/FormExample.test.jsx`、`Pagination.test.jsx`、`ValidationPopover.test.jsx` 验证用户可观察的错误、受控操作、提交、失败、防重复、回填和 reset。jsdom 缺少的 Radix 布局 / Pointer 接口仅在相关测试内补足；真实浏览器测试不能由这些替身代替。
- 浏览器：`tests/e2e/forms.spec.js` 验证桌面/移动端字段交互、提交反馈、分页错误，三套预设 × 浅深色；三个密度分布在预设场景中检查，不宣称完整密度笛卡尔积。截图用于人工检查，不自动建立或更新视觉基准。
- 运行 `npm run test:vitest`、`npm run test:e2e`，以及相关 Lint、Registry 与依赖变更的生产构建。浏览器安装与本机限制见 [浏览器验证](browser-verification.md)。
- 新增公共组件按 [组件开发](ai-design/component-development.md) 同步 Gallery；普通表单页面不自动注册模板。最后按 [任务收尾检查](development.md#任务收尾检查) 报告实际命令、结果、数据范围与未验证项。
