# 业务开发指南

本文件保存路由、Redux、接口、表单与联调的详细实现示例。项目关键约束和命令见 [AGENTS.md](../AGENTS.md)，UI 规范见 [设计系统](design-system.md)。按任务阅读相关章节，以实际源码为准。

## 新增页面的接入步骤

1. 在 `src/containers/<ModuleName>/index.js` 编写页面。
2. 在 `src/containers/index.js` 导入并导出页面，例如 `import Article from './Article'`。
3. 在 `src/routes.js` 最外层 `/*` 配置的 `routes` 数组中添加路由，放在兜底 `*` 之前：

   ```js
   { path: '/articles', component: Article, needAuth: true }
   ```

   这里使用项目的 `component` 字段，值是组件函数，不是 JSX。业务后台默认设置 `needAuth: true`；登录等明确公开的页面不加。`PrivateRoute` 负责登录校验。

4. 需要菜单入口时，在 `src/components/MainMenu/items.js` 的 `menuItems` 数组中添加 `{ to: '/articles', label: '文章管理', icon: FileText }`，并从 `lucide-react` 导入图标。
5. 页面使用 Redux 模块时，在 `src/reducers.js` 的 `combineReducers` 中注册 reducer，字段名必须与 selector 一致。

MainMenu 根据 URL 自动显示选中状态并展开祖先菜单，不接收 `defaultSelectedKeys`、`defaultOpenKeys` 等参数。叶节点默认精确匹配，设置 `end: false` 可匹配详情等子路由。分组使用 `{ key, label, icon, children: [...] }`，支持递归子菜单；分组点击展开，叶节点 `to` 负责跳转。侧栏收起时使用 DropdownMenu 展示子导航，移动端在 Sheet 内展开。Playground 内部页签使用 `?view=`，与浏览器前进后退同步；不作为左侧业务子菜单。

参考页面：`src/containers/Home/index.js` 的布局和 `src/containers/Auth/ChangePassword/index.js` 的完整表单交互。`src/containers/sample/` 是示意代码，尚未接入页面导出、路由和 reducer；使用前检查相对路径与接口，不将其当成已经完成的业务模块。

## 页面布局与组件 API

新页面优先使用设计系统 Layout，接入见 [设计系统布局](design-system.md#布局)。以下说明既有手动组合页面的等价结构，维护这些页面时不要再重复套一层 Layout。顶部栏和侧栏各放置一次，MainPage 已处理顶部高度与侧栏宽度，不在页面重复计算偏移。

```jsx
<div className="flex min-h-screen flex-col bg-muted/40">
  <Helmet title={`文章管理 - ${config.app.title}`} />
  <MainHeader />
  <MainMenu />
  <MainPage>
    <PageHeader breadcrumb={[{ name: '首页', link: '/' }, { name: '文章管理' }]} title="文章管理" info="管理文章内容" />
    <PageContent>
      <PageSearch>{/* 搜索表单，可选 */}</PageSearch>
      <PageSection>{/* 列表或表单 */}</PageSection>
    </PageContent>
  </MainPage>
</div>
```

Helmet 从 `react-helmet-async` 导入，config 从 `@/config` 导入。面包屑格式是 `{ name, link }`，当前页面可以省略 link。

- `PageHeader`：breadcrumb、title、info、actions、children、paddingBottom。
- `PageSection`：children、paddingTop、minHeight、marginTop。
- `FormBox`：表单内容宽度与布局容器。
- `PageSearch`、`ListToolbar`：搜索区和列表工具栏容器。
- 业务分页从 `@/components` 导入 `Pagination`，参数是 **page、perPage、total、onChange**。不要使用其他组件库的 current、pageSize、showTotal 等参数。

后台页面保持清楚、稳定，重点是表单、列表与操作反馈。使用语义化 HTML；图标按钮有 aria-label，输入有 label，表格有表头，行使用稳定业务 ID 作为 key。

## Redux 模块：一套连贯的实现示例

本地输入、弹窗开关等 UI 状态使用 useState。页面需要共享数据、接口状态或与现有 Redux 流程整合时，再创建 Redux 模块；不要为每个组件机械创建整套文件。

以下示例对应 `src/containers/Article/`。`/articles` 接口和响应字段仅为示例，实际开发先确认 API 契约，不把示例地址当作已有后端。

### api.js

```js
import { request } from '@/utils/api';

export const getListApi = (options, dispatch, getState) => request({ endpoint: '/articles', method: 'GET', qs: options }, dispatch, getState);

export const saveItemApi = (values, dispatch, getState) => request({ endpoint: '/articles', method: 'POST', body: values }, dispatch, getState);
```

createActionAsync 会将调用参数依次传给 API 函数，并在末尾附加 dispatch、getState。因此上面的 getList 必须传入 options 对象，例如 `getList({ page: 1, per_page: 10 })`；saveItem 传入表单对象。

API 函数直接返回 request 的 Promise，不必增加只做原样抛出的 try/catch，也不在 API 中弹通知或处理 reducer 状态。

### actions.js

```js
import { createAction, createActionAsync } from 'redux-act-reducer';
import { getListApi, saveItemApi } from './api';

const prefix = 'ARTICLE';
export const GET_LIST = `${prefix}_GET_LIST`;
export const SAVE_ITEM = `${prefix}_SAVE_ITEM`;
export const CLEAR_ERROR = `${prefix}_CLEAR_ERROR`;
export const RESET_SUBMIT = `${prefix}_RESET_SUBMIT`;

export const getList = createActionAsync(GET_LIST, getListApi);
export const saveItem = createActionAsync(SAVE_ITEM, saveItemApi);
export const clearError = createAction(CLEAR_ERROR);
export const resetSubmit = createAction(RESET_SUBMIT);
```

普通 action 携带参数时使用 `createAction(TYPE, 'field')`，reducer 中从 `action.field` 读取。模块 action type 使用模块名大写前缀，避免跨模块冲突。

### reducer.js

```js
import { produce } from 'immer';
import { createReducer } from 'redux-act-reducer';
import { getErrorMessage } from '@/utils/error';
import { GET_LIST, SAVE_ITEM, CLEAR_ERROR, RESET_SUBMIT } from './actions';

const initialState = {
  items: [],
  page: 1,
  per_page: 10,
  record_count: 0,
  isFetching: false,
  listFailed: false,
  submitting: false,
  editSuccess: false,
  error: ''
};

const reducer = createReducer(
  {
    [CLEAR_ERROR](state) {
      return produce(state, draft => {
        draft.error = '';
      });
    },
    [RESET_SUBMIT](state) {
      return produce(state, draft => {
        draft.editSuccess = false;
      });
    },
    [GET_LIST](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.isFetching = true;
            draft.listFailed = false;
            draft.error = '';
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            const data = action.res.body;
            draft.isFetching = false;
            draft.items = data.items;
            draft.page = data.page;
            draft.per_page = data.per_page;
            draft.record_count = data.record_count;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.listFailed = true;
            draft.error = getErrorMessage(action.err);
          });
        }
      };
    },
    [SAVE_ITEM](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.submitting = true;
            draft.editSuccess = false;
            draft.error = '';
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.submitting = false;
            draft.editSuccess = true;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.submitting = false;
            draft.editSuccess = false;
            draft.error = getErrorMessage(action.err);
          });
        }
      };
    }
  },
  initialState
);

export default reducer;
```

异步 action 的 type 不变，subType 是 REQUEST / SUCCESS / FAILURE；使用以上 createReducer 嵌套处理方式，不套用其他 Redux 库的写法。加载状态和提交状态分别处理；失败必须结束 pending 状态。根据接口字段显式更新数据，避免把整个响应的任意字段写入状态。

在 `src/reducers.js` 中导入 `article` 并加入已有 combineReducers，保留 auth、home、user 及 RESET_STATE 处理：

```js
import article from './containers/Article/reducer';
// 在已有的 combineReducers({ auth, home, user, ... }) 中加入 article。
```

### selectors.js

```js
import { createSelector } from 'reselect';
const selectArticle = state => state.article;
export const selectError = createSelector(selectArticle, data => data.error);
export const selectFetching = createSelector(selectArticle, data => data.isFetching);
export const selectListFailed = createSelector(selectArticle, data => data.listFailed);
export const selectSubmitting = createSelector(selectArticle, data => data.submitting);
export const selectEditSuccess = createSelector(selectArticle, data => data.editSuccess);
export const selectList = createSelector(selectArticle, data => ({
  items: data.items,
  page: data.page,
  per_page: data.per_page,
  record_count: data.record_count
}));
```

## 请求、鉴权与异步错误

业务接口统一使用 `@/utils/api` 的 request，不直接使用 fetch 或自行读写 token。

| 参数     | 说明                                                                |
| -------- | ------------------------------------------------------------------- |
| endpoint | 与 config.apiUrl 拼接的路径，以 / 开头；不要手动加开发代理前缀 /api |
| url      | 完整地址，与 endpoint 二选一                                        |
| method   | GET / POST / PUT / PATCH / DELETE                                   |
| qs       | URL 查询参数对象                                                    |
| body     | 请求体对象                                                          |
| headers  | 额外请求头                                                          |
| needAuth | 默认 true，公开接口才设为 false                                     |

request 负责鉴权 token 注入及业务错误判断，返回完整响应，业务数据在 `res.body`。约定响应形如 `{ errcode: 0, errmsg: 'ok', ...业务字段 }`；实际数据字段以接口为准。

`dispatch(createActionAsync生成的action(...))` 返回 Promise，成功值为包含 request / success 的 action 对象，**不是直接返回 res 或 res.body**；失败会 reject action 对象。页面通过 selector 读取结果，reducer 从 action.err 提取错误。

异步请求必须处理 reject，避免 unhandled rejection。如果 reducer 已写入错误，组件 catch 不重复弹通知：

```js
dispatch(getList({ page: 1, per_page: 10 })).catch(() => {
  // reducer 处理失败状态，错误由页面 effect 展示。
});
```

页面进入时清理过期错误，错误反馈在 effect 中执行，禁止在 render 中调用 toast。Root 已挂载 Toaster，不要在每个页面重复挂载。

```js
useEffect(() => {
  dispatch(clearError());
}, [dispatch]);
useEffect(() => {
  if (!err) return;
  toast.error(err);
  dispatch(clearError());
}, [dispatch, err]);
```

普通非 Redux Promise 的错误用 `getErrorMessage(err, '操作失败')` 提取；`getErrorCode` 用于确实需要按错误码分支的场景。不要同时在 catch 和错误 effect 中展示相同错误。列表的 listFailed 状态独立于一次性通知 error，清除通知不能同时清除页面的失败状态。

登录、刷新 token、退出清理已由 Auth 和 utils/auth 实现，常规业务不修改；路由保护与菜单显示不能替代服务端授权。新 reducer 需加入已有状态树，确保退出时也被 RESET_STATE 清理。

## 列表、搜索与分页

- 查询条件保存在页面本地或模块状态中，输入草稿与已提交的搜索条件区分。
- 初次加载和新搜索从第 1 页开始；切换每页数量也回到第 1 页。
- 翻页携带已提交的查询条件与 per_page，不能丢失过滤条件。
- 列表展示加载、空数据和失败状态；失败时不要将旧数据伪装成新查询结果。
- 简单列表可以使用语义化 HTML table；需要 shadcn Table 时先通过 CLI 添加，不假设它已经存在。不直接引入另一套表格或请求框架。

以下片段放在标准页面布局内，getList、selectors 与上面的 Article 示例一致：

```jsx
const [name, setName] = useState('');
const [query, setQuery] = useState('');
const { items, page, per_page, record_count } = useSelector(selectList);
const isFetching = useSelector(selectFetching);
const listFailed = useSelector(selectListFailed);
const err = useSelector(selectError);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(clearError());
  dispatch(getList({ page: 1, per_page: 10 })).catch(() => {});
}, [dispatch]);
// 同时按上一节添加错误通知 effect。

const search = event => {
  event.preventDefault();
  const value = name.trim();
  setQuery(value);
  dispatch(getList({ page: 1, per_page, name: value })).catch(() => {});
};
const changePage = (nextPage, nextSize) => {
  dispatch(getList({ page: nextSize === per_page ? nextPage : 1, per_page: nextSize, name: query })).catch(() => {});
};
```

```jsx
<PageSearch>
  <form onSubmit={search} className="flex flex-wrap items-end gap-3">
    <div className="space-y-2">
      <Label htmlFor="article-search">文章名称</Label>
      <Input id="article-search" value={name} onChange={event => setName(event.target.value)} />
    </div>
    <Button type="submit" disabled={isFetching}>搜索</Button>
  </form>
</PageSearch>
<PageSection>
  {isFetching ? <p role="status">加载中…</p> : listFailed ? <p role="alert">加载失败，请重试</p> : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr><th scope="col" className="p-3">名称</th></tr></thead>
        <tbody>{items.length ? items.map(item => <tr key={item.id}><td className="p-3">{item.name}</td></tr>) : <tr><td className="p-3">暂无数据</td></tr>}</tbody>
      </table>
    </div>
  )}
  <Pagination page={page} perPage={per_page} total={record_count} onChange={changePage} />
</PageSection>
```

上述示例是流程片段，不是完整页面文件。需要从 React、React Redux、模块 actions / selectors 导入所用函数，并组合标准布局及错误处理。同页可能并发发起不同查询时，增加请求标识或序列控制，避免慢响应覆盖新结果。

## 表单、新增与编辑

表单使用原生 form 和 shadcn Input、Label、Button；不使用 Form.Item、Input.Password、loading、htmlType 等其他组件库 API。密码输入使用 `<Input type="password" />`，提交按钮使用 `type="submit"` 与 disabled。

- 每个字段设置唯一 id、label 和 name；用 required、minLength、maxLength、type 校验基本输入。
- 使用 FormData 获取值，字符串按业务规则 trim，数字/布尔/文件显式转换；不要把缺失值、空字符串与 0 混为一谈。
- 跨字段和业务校验失败时显示具体原因，设置 aria-invalid、aria-describedby，必要时用 role="alert"。
- 提交时禁用提交按钮，处理 reject。保存失败保留输入；成功后按需求导航或重置表单。
- 编辑表单先加载详情，再填充字段。异步 defaultValue 不会自动刷新已有输入，使用受控状态，或在详情就绪后挂载表单。

使用上面 Article 模块的保存流程：

```jsx
const dispatch = useDispatch();
const navigate = useNavigate();
const submitting = useSelector(selectSubmitting);
const editSuccess = useSelector(selectEditSuccess);

useEffect(() => {
  dispatch(clearError());
  dispatch(resetSubmit());
}, [dispatch]);
useEffect(() => {
  if (!editSuccess) return;
  toast.success('保存成功');
  dispatch(resetSubmit());
  navigate('/articles');
}, [dispatch, editSuccess, navigate]);

const submit = async event => {
  event.preventDefault();
  if (submitting) return;
  const data = new FormData(event.currentTarget);
  const name = String(data.get('name') || '').trim();
  if (!name) {
    toast.error('请输入名称');
    return;
  }
  try {
    await dispatch(saveItem({ name }));
  } catch {
    /* reducer 与错误 effect 负责反馈 */
  }
};
```

```jsx
<FormBox>
  <form onSubmit={submit} className="space-y-5">
    <div className="space-y-2">
      <Label htmlFor="article-name">名称</Label>
      <Input id="article-name" name="name" required maxLength={100} />
    </div>
    <Button type="submit" disabled={submitting}>
      {submitting ? '保存中…' : '保存'}
    </Button>
  </form>
</FormBox>
```

表单还需按错误处理章节读取 selectError 并添加 effect。resetSubmit 应在进入页面和消费成功状态时调用，避免上次保存的 editSuccess 导致重入页面立即跳转。一个操作只弹一次成功提示，不同时在 await 后和 effect 中处理同一成功结果。

## shadcn/ui、样式与资源

需要新基础组件时运行 `npx shadcn@latest add <component>`。`components.json` 中 `tsx: false` 生成官方 JavaScript `.jsx`，不改为 `.js` 或 `.tsx`。生成组件从具体文件导入，不要求加入业务 components/index.js。普通业务需求通过组合或业务包装组件实现，不无故修改生成目录。

业务 className 合并使用 `@/utils/cn` 的 cn。生成组件如使用其自身依赖，按生成结果处理，不为统一导入而批量改动。

```js
import styles from './styles.css';
// JSX: <div className={cn(styles.content, 'flex gap-4')} />
```

业务 `.css` 默认是 CSS Modules，不使用 `.module.css` 后缀。全局选择器用 `:global`，不要为了类名风格改动已有 CSS Modules class。`src/assets/css/main.css` 是全局入口，`src/design-system/tokens/` 也是全局 CSS；主题和 Tailwind 工具类不能被局部化。主题变量在 tokens 中定义，由 main.css 导入。

PostCSS 当前支持 nesting、simple vars、mixins；新增页面优先使用 Tailwind 与原生 CSS 变量，不额外创建一套主题值。Tailwind 动态样式使用完整类名映射，不拼接 `bg-${color}-500` 等无法静态扫描的类名。先使用主题语义类 bg-background、text-foreground、text-muted-foreground、border-border 等。

SVG、图片、字体通过 Vite 原生导入或 CSS url() 使用；SVG 默认导入为图片 URL，不是 React 组件。通用图标从 lucide-react 导入。不要为普通 SVG 资源重新添加自定义转换插件。

## 环境、模板与跳转

配置集中在 `src/config.js`，各环境在 environments 中定义，业务通过 config 读取。Vite 根据 mode 选择 dev / staging / prod，并替换 process.env.STAGE；不要在业务代码重新判断 hostname 维护第二套环境配置。示例后端域名需按实际项目配置。

开发请求由 config.apiUrl 的 /api 前缀进入 dev.proxyTarget 代理，Vite 去掉前缀。生产使用对应 apiUrl，若使用相对 /api，需要部署服务器反向代理。配置会公开给浏览器，不能存密钥。

模板只放在 `src/template/index.html`，开发和生产共用，根目录不另建 index.html。保留 module script 指向 /src/index.js，Vite 构建时转换为产物链接。主配置位于根目录 vite.config.mjs，辅助插件在 vite/。业务页面通常无需改这些文件。

组件内使用 React Router 的 useNavigate 或 Link / NavLink；组件外使用 `@/utils/navigation` 的 navigateTo / navigateReplace。站内常规导航不直接修改 location 触发整页刷新。

## 无后端联调

使用 `npm run dev:mock` 启动本地模拟 API，默认端口为开发端口加 1，账号 admin / admin123。模拟登录、用户信息、token 刷新、修改密码和退出；修改密码和会话只存在于内存，重启后重置。无需修改 PrivateRoute、鉴权或业务 API 调用。

新页面需要模拟数据时，在 `vite/mock-api.mjs` 按相同请求和响应协议添加明确的路由，未知 /api 接口返回 404，不伪装所有请求成功。模拟接口不得替代真实接口验证。普通 dev 使用配置的后端代理；mock 不能用于 build 或 preview。
