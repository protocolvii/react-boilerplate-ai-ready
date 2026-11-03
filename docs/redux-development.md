# Redux 模块与异步接口开发

业务数据沿用 React Redux + Redux Thunk + redux-act-reducer + Immer + Reselect。新增异步业务先读本文相关章节，再检查接口协议和目标模块源码；不引入第二套请求 / 状态框架，不把 UI 库的表单 API 混进 Redux。

## 先判断放在哪里

| 场景                                           | 文件与状态归属                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| 领域列表、详情、CRUD 或跨页面共享的服务端数据  | 在领域模块维护 `api.js / actions.js / reducer.js / selectors.js`                  |
| 同一领域增加查询或操作                         | 扩展已有模块；不是每个接口、弹窗、Tab 都另建四文件                                |
| 上传、下载、临时签名、仅当前组件使用的短期结果 | 可在已有 api / actions 中增加普通 thunk，由调用方管理局部状态；不机械加入 reducer |
| 表单草稿、弹窗、当前选中行                     | Hooks / React Hook Form；不把每次键入同步到 Redux                                 |
| 静态页面、Gallery 本地演示                     | 不为套模板创建 Redux 或虚构后端                                                   |
| 多个位置同时使用不同查询的同类数据             | 明确实例 / 父实体归属，按 key 分槽或使用独立局部状态，不能共用一个列表槽互相覆盖  |

完整业务页面的列表、详情和增删改默认使用领域四文件套路；局部短期结果才选择普通 thunk，不因只在一个页面出现就绕开已有领域模块。一个模块代表业务领域，不代表单一页面。入口页、详情和嵌套业务页可以复用同一领域 action / selector；纯视图通过 props 接收数据、loading 和事件，不偷偷发另一套请求。

## 文件与命名套路

```text
src/containers/Article/
  index.js       页面入口、数据装配与交互
  api.js         请求参数、endpoint、method、qs、body；返回请求 Promise
  actions.js     大写 action type、同步 action、异步 action / 少量组合 thunk
  reducer.js     声明初值，处理 REQUEST / SUCCESS / FAILURE 与清理
  selectors.js   从已注册的状态节点派生视图数据
  details.js     按需：详情视图或路由页面
  edit.js        按需：独立新增 / 编辑页面
  list.js        按需：可复用列表视图，不假设它本身是已注册路由
  schema.js      按需：表单 Zod 规则
  styles.css     按需：局部 CSS Modules
```

- 目录 PascalCase，文件沿用以上小写名称，全部业务源码为 JavaScript `.js`。先判断已有模块归属，再新增目录。
- action type 使用领域大写前缀，如 `ARTICLE_GET_ARTICLE_LIST`；函数使用 `getArticleList`、`getArticleDetail`、`createArticle`、`updateArticle`、`deleteArticle`；API 函数对应加 `Api` 后缀。
- 多词领域如 `GasCylinder`：状态节点 `gasCylinder`，前缀 `GAS_CYLINDER`。普通 action 参数命名与 reducer 读取字段一致。
- api、action、selector 优先 named export，reducer 与页面 default export；模块内相对导入，跨模块按当前别名约定。
- 下文 Article 是可裁剪模板，不是已接入的业务模块。`/articles` 和响应字段是示例契约，不代表脚手架已有接口；真实功能先确认协议并按需补充 Vite Mock。

## 四文件模板

仅复制本次需要的操作；例如只读列表不复制新增、编辑和删除。以下约定列表 body 为 `{ items, page, per_page, record_count, page_count? }`，详情 body 含 `id / name / status`，业务成功仍按现有 `errcode / errmsg` 协议。实际字段不同就在边界显式适配，不用空数组伪装协议正确。

### api.js

```js
import { request } from '@/utils/api';

export const getArticleListApi = (options, dispatch, getState) => {
  const qs = { page: options.page ?? 1, per_page: options.per_page ?? 10 };
  if (options.name?.trim()) qs.name = options.name.trim();
  if (options.status !== undefined && options.status !== null && options.status !== '') qs.status = options.status;
  if (options.is_enabled !== undefined && options.is_enabled !== null && options.is_enabled !== '') qs.is_enabled = options.is_enabled;
  return request({ endpoint: '/articles', method: 'GET', qs }, dispatch, getState);
};

export const getArticleDetailApi = (id, dispatch, getState) => request({ endpoint: `/articles/${encodeURIComponent(id)}`, method: 'GET' }, dispatch, getState);

export const createArticleApi = (values, dispatch, getState) => request({ endpoint: '/articles', method: 'POST', body: values }, dispatch, getState);

export const updateArticleApi = (id, values, dispatch, getState) => request({ endpoint: `/articles/${encodeURIComponent(id)}`, method: 'PUT', body: values }, dispatch, getState);

export const deleteArticleApi = (id, dispatch, getState) => request({ endpoint: `/articles/${encodeURIComponent(id)}`, method: 'DELETE' }, dispatch, getState);
```

参数顺序是约定的一部分：

| 调用                                                  | API 实际收到                           |
| ----------------------------------------------------- | -------------------------------------- |
| `dispatch(getArticleList({ page: 1, per_page: 10 }))` | `(options, dispatch, getState)`        |
| `dispatch(getArticleDetail(id))`                      | `(id, dispatch, getState)`             |
| `dispatch(updateArticle(id, values))`                 | `(id, values, dispatch, getState)`     |
| 无业务参数的 `dispatch(getCategories())`              | 对应 API 签名为 `(dispatch, getState)` |

createActionAsync 按调用参数原样展开，末尾才附加 dispatch、getState。声明需要 options 的 action 必须传 `{}`，不能省略；给 API 写 `options = {}` 也不能修复参数错位，因为省略时第一个参数已经是 dispatch。多参数接口也不能少传中间参数。

API 只组织请求，不 Toast、不跳转、不修改 reducer。直接返回 request Promise，只有确需转换响应或额外处理时才 await；不写仅包一层 `Promise.resolve / reject` 的 try/catch。不要把 `0`、`false` 当作无过滤条件；null、空字符串与“全部”的含义按契约处理。`endpoint` 不加代理前缀 `/api`，不用 fetch、自取 token 或修改鉴权流程；请求参数与错误协议见 [业务开发指南](development.md#请求鉴权与异步错误)。

### actions.js

```js
import { createAction, createActionAsync } from 'redux-act-reducer';
import { getArticleListApi, getArticleDetailApi, createArticleApi, updateArticleApi, deleteArticleApi } from './api';

const prefix = 'ARTICLE';
export const GET_ARTICLE_LIST = `${prefix}_GET_ARTICLE_LIST`;
export const GET_ARTICLE_DETAIL = `${prefix}_GET_ARTICLE_DETAIL`;
export const CREATE_ARTICLE = `${prefix}_CREATE_ARTICLE`;
export const UPDATE_ARTICLE = `${prefix}_UPDATE_ARTICLE`;
export const DELETE_ARTICLE = `${prefix}_DELETE_ARTICLE`;
export const CLEAR_ERROR = `${prefix}_CLEAR_ERROR`;
export const CLEAR_ARTICLE_LIST = `${prefix}_CLEAR_ARTICLE_LIST`;
export const RESET_SUBMIT = `${prefix}_RESET_SUBMIT`;
export const INIT_DATA = `${prefix}_INIT_DATA`;

export const clearError = createAction(CLEAR_ERROR);
export const clearArticleList = createAction(CLEAR_ARTICLE_LIST);
export const resetSubmit = createAction(RESET_SUBMIT);
export const initData = createAction(INIT_DATA);
export const getArticleList = createActionAsync(GET_ARTICLE_LIST, getArticleListApi);
export const getArticleDetail = createActionAsync(GET_ARTICLE_DETAIL, getArticleDetailApi);
export const createArticle = createActionAsync(CREATE_ARTICLE, createArticleApi);
export const updateArticle = createActionAsync(UPDATE_ARTICLE, updateArticleApi);
export const deleteArticle = createActionAsync(DELETE_ARTICLE, deleteArticleApi);
```

携带本地参数时显式命名，例如 `createAction(SET_SELECTED_ID, 'id')`，reducer 读取 `action.id`；不能照搬其他库的 payload 约定。不要额外定义 `_REQUEST / _SUCCESS / _FAILURE` 三套 type，也不要为普通请求重复手写三阶段 thunk。

### reducer.js

```js
import { produce } from 'immer';
import { createReducer } from 'redux-act-reducer';
import { getErrorMessage } from '@/utils/error';
import { GET_ARTICLE_LIST, GET_ARTICLE_DETAIL, CREATE_ARTICLE, UPDATE_ARTICLE, DELETE_ARTICLE, CLEAR_ERROR, CLEAR_ARTICLE_LIST, RESET_SUBMIT, INIT_DATA } from './actions';

const initialState = {
  items: [],
  page: 1,
  per_page: 10,
  page_count: 1,
  record_count: 0,
  isFetching: false,
  listFailed: false,
  currentArticle: null,
  detailFetching: false,
  detailFailed: false,
  submitting: false,
  editSuccess: false,
  deleting: false,
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
    [CLEAR_ARTICLE_LIST](state) {
      return produce(state, draft => {
        draft.items = [];
        draft.page = 1;
        draft.per_page = 10;
        draft.page_count = 1;
        draft.record_count = 0;
        draft.isFetching = false;
        draft.listFailed = false;
      });
    },
    [INIT_DATA]() {
      return initialState;
    },
    [GET_ARTICLE_LIST](state, action) {
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
            draft.listFailed = false;
            draft.items = data.items;
            draft.page = data.page;
            draft.per_page = data.per_page;
            draft.record_count = data.record_count;
            draft.page_count = data.page_count ?? Math.max(1, Math.ceil(data.record_count / data.per_page));
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
    [GET_ARTICLE_DETAIL](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.currentArticle = null;
            draft.detailFetching = true;
            draft.detailFailed = false;
            draft.error = '';
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            const data = action.res.body;
            draft.currentArticle = { id: data.id, name: data.name, status: data.status };
            draft.detailFetching = false;
            draft.detailFailed = false;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.detailFetching = false;
            draft.detailFailed = true;
            draft.error = getErrorMessage(action.err);
          });
        }
      };
    },
    [CREATE_ARTICLE](state, action) {
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
    },
    [UPDATE_ARTICLE](state, action) {
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
    },
    [DELETE_ARTICLE](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.deleting = true;
            draft.error = '';
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.deleting = false;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.deleting = false;
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

保留嵌套三阶段 + produce 的明确写法。所有参与渲染的字段在初值声明，成功按协议逐字段更新；不把响应 body 的任意键整包写进状态。列表、详情、提交、删除、下拉选项和子列表按实际并发关系分别管理 pending；不能因为新增成功就把另一个列表请求的 loading 关掉。

- `CLEAR_ERROR` 只消费通知消息，不改变 pending、失败页面、详情或成功标记。
- `RESET_SUBMIT` 只清除本次提交结果，进入编辑 / 打开弹窗及消费结果后按需执行。
- `CLEAR_ARTICLE_LIST` 只清列表，`INIT_DATA` 重置整个领域；共享模块不要在每个子组件挂载时全部重置。
- 清理状态不等于取消请求；同一槽可能并发时按后面的 requestId 分支处理，不能认为 initData 可阻止旧响应回来。
- 默认翻页替换 items；只有明确的“加载更多”才追加，并另行处理重置、去重和页序，不能将自动 concat 当成所有列表的规则。

### selectors.js

```js
import { createSelector } from 'reselect';

export const selectArticle = state => state.article;
export const selectError = createSelector(selectArticle, data => data.error);
export const selectIsFetching = createSelector(selectArticle, data => data.isFetching);
export const selectListFailed = createSelector(selectArticle, data => data.listFailed);
export const selectSubmitting = createSelector(selectArticle, data => data.submitting);
export const selectDeleting = createSelector(selectArticle, data => data.deleting);
export const selectEditSuccess = createSelector(selectArticle, data => data.editSuccess);
export const selectArticleList = createSelector(selectArticle, data => ({
  items: data.items,
  page: data.page,
  per_page: data.per_page,
  page_count: data.page_count,
  record_count: data.record_count,
  isFetching: data.isFetching,
  failed: data.listFailed
}));
export const selectCurrentArticle = createSelector(selectArticle, data => ({
  data: data.currentArticle,
  isFetching: data.detailFetching,
  failed: data.detailFailed
}));
```

组合对象在 createSelector 的结果函数中构造，组件不重复拼分页字段，也不假设所有查询都用顶层 isFetching。不能用 `state.article || {}` 隐藏漏注册；按新模块初值保证数据类型。对同一状态反复调用 selector，应获得稳定的组合结果引用。

## 工程接入顺序

1. 先确认接口方法、路径、参数、响应数据与业务错误；在现有领域按需建立四文件。
2. 在 `src/reducers.js` 导入 reducer 并注册 `article`，与 selector 的 `state.article` 一致；保留 auth / user 和 RESET_STATE 全树清理。
3. 页面通过 actions 发起请求、通过 selectors 读状态；按 [页面接入规范](development.md#新增页面的接入步骤) 完成 containers 导出、路由和条件性的菜单，业务页面默认 needAuth:true。
4. 缺后端时在 `vite/mock-api.mjs` 补同协议的明确路由；未知接口仍应 404。Gallery 本地示例不是这些接口的 Mock。
5. 按任务测试状态机、交互与实际请求；不要因为四文件存在就声称功能已完成。

## 页面如何发起和接收异步结果

当前安装的 redux-act-reducer 行为已按源码核实：

```js
const action = await dispatch(createArticle({ name: '示例' }));
const createdId = action.success.res.body.id; // 仅在确实需要后续 ID 时读取

try {
  await dispatch(updateArticle(id, values));
} catch (rejected) {
  const cause = rejected.failure.err; // 默认 createActionAsync 的失败包装
}
```

request 返回完整 res，reducer 的 SUCCESS 读取 `action.res.body`，FAILURE 读取 `action.err`。dispatch 返回 `{ request, success }` 或 reject `{ request, failure }`，不是 res、res.body 或 Toolkit 的 payload；不要调用 `.unwrap()`。默认 action 不携带原始 args、id、qs、payload、meta 或 requestId，不能在 reducer 凭空读取 `action.id` 来标记正在删哪一行。

### 列表、搜索和分页

- 常规可返回 / 分享的路由列表优先将已提交条件、page、per_page 放 URL，使用 React Router 7 的 useSearchParams / useNavigate；输入草稿与已提交条件分开。
- 从 URL 解析数字、枚举和布尔，校验异常值；搜索及修改每页数量从第 1 页开始。翻页保留全部已提交筛选，不把尚未提交的输入当成查询。
- 选择一个请求触发点：URL 驱动时 effect 监听解析后的条件，事件只更新 URL；局部状态驱动时使用一个明确的加载入口。不要 URL effect 与按钮 handler 同时发相同查询。
- 初次加载、失败、空、成功分别展示；失败时不把上一查询的数据当作新结果。通知清除后仍保留 listFailed，可再次重试。
- 同时需要总览列表与关联列表时，后者独立维护 items、分页、isFetching、failed；不要改动主列表的 page / total。

URL 驱动的核心片段如下；它是模块页面中的流程片段，不是完整页面：

```js
const [params, setParams] = useSearchParams();
const positiveInteger = (value, fallback) => (Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback);
const page = positiveInteger(params.get('page'), 1);
const perPage = positiveInteger(params.get('per_page'), 10);
const name = params.get('name') || '';
const status = params.get('status');

useEffect(() => {
  dispatch(getArticleList({ page, per_page: perPage, name, status })).catch(() => {});
}, [dispatch, page, perPage, name, status]);

const changePage = (nextPage, nextSize) =>
  setParams(previous => {
    const next = new URLSearchParams(previous);
    next.set('page', String(nextSize === perPage ? nextPage : 1));
    next.set('per_page', String(nextSize));
    return next;
  });
```

数字合法还不等于业务合法；每页条数、状态枚举和“全部”的含义按接口及 UI 选项进一步约束。无需返回状态的简单列表可用本地 appliedQuery，保留同样的搜索 / 翻页规则。单纯分页和搜索不强制用 React Hook Form。

### 详情和编辑回填

路由 useParams 读取 id，验证后再请求。进入新详情清掉旧实体的显示状态；请求完成前展示 loading，失败展示可重试页面，不先露出上一条记录。只有当前实体 ID 与路由一致、详情加载成功后才向 RHF `reset(record)` 回填；id 比较按协议归一化类型，依赖变化包括 id / 对应数据，不能只写空依赖数组。

不要每次列表刷新、选项载入或 render 都 reset 表单覆盖用户输入。切换编辑对象时明确丢弃 / 保留草稿；由列表打开的编辑弹窗可按业务直接用已有完整记录，字段不全才请求详情。接口和表单的类型转换与固定错误行见 [表单开发](form-development.md)。

### 保存、关闭与成功反馈

默认推荐在提交 handler await 成功后处理一次成功反馈、关闭 / 导航及刷新；接口失败交给 reducer 错误状态和统一 effect，不清空表单，也不关闭弹窗。

```js
const save = async values => {
  try {
    await dispatch(id ? updateArticle(id, values) : createArticle(values));
  } catch {
    return; // reducer 与错误 effect 负责反馈；RHF 输入保持原状
  }
  toast.success('保存成功');
  dispatch(resetSubmit());
  closeEditor();
  dispatch(getArticleList(appliedQuery)).catch(() => {});
};
```

RHF 提交 handler 必须返回 / await 这段 Promise，按钮结合 isSubmitting / selectSubmitting 禁用并防重入。保存成功后再关闭；列表刷新失败属于刷新失败，不把已经保存的记录说成未保存。

已有模块若使用 optSuccess / editSuccess + effect，可以继续该模式，但必须与 await 成功处理二选一：进入时重置标记、记录“本组件确实发起过提交”、消费后清除。仅在进入 effect 里 reset 不足以防止同次挂载的另一个 effect 读到上次的 true；不要据此立即跳转。新模块不为同一保存额外维护多组同义成功标记。

### 删除和行操作

- 使用 ConfirmDialog；回调返回真实异步 Promise。失败继续 reject，不在 catch 中 resolve 假装完成；onConfirm 未成功不能提前移除行或关闭对话框。
- 默认删除成功后按当前已提交条件刷新；删掉当前页最后一条且 page > 1 时先回上一页，避免留在无效空页。URL 驱动时变页交给 effect，同页刷新才显式请求，不两处重复请求。
- 行 ID / 弹窗目标通常属于页面局部状态；库默认 REQUEST 没有 id。若业务要同时执行多行操作，再按 id 独立管理状态，不用单一 deleting boolean 假装支持并发。
- 当前 ConfirmDialog 失败时内置通用重试提示。配合 Redux 统一错误 Toast 时不要在回调 catch 中再 Toast；如果只需要对话框本地错误反馈，可使用下面的普通 thunk 分支，避免为一次确认维护全局错误通知。

### 选项、关联子列表和跨模块

优先复用已有领域的 action / selector，例如详情中的关联资源使用其领域请求，不复制 API 到每个嵌套目录。模块的 clearError 只对应自己的错误节点，不能将其他模块的错误清到错误位置。

选项独立加载，后端失败不能伪装为“没有选项”。父级变化先清空不再适用的子级值，再请求子级选项；已提交搜索条件和编辑草稿不能共享同一个正在变化的父级状态。并行的搜索栏 / 编辑弹窗、两个实体 Tab 若需要不同选项，使用按 parentId / instanceKey 分槽的缓存，或各自局部状态；不要让同一个全局 options 数组交替覆盖。

## 普通 thunk 与多步操作

只需要临时响应，不需要保存到 Redux 时，可以使用同一 api.js 的函数，通过普通 thunk 注入 dispatch / getState：

```js
// actions.js；例如已有 deleteArticleApi，但本次确认只由组件管理 pending / 失败。
export const deleteArticleOnce = id => (dispatch, getState) => deleteArticleApi(id, dispatch, getState);
```

`dispatch(deleteArticleOnce(id))` 直接 resolve res、reject 原始 err；不产生三阶段 action，也不会写入模块 error。不能把它与 createActionAsync 的返回包装混淆。此时调用方自己处理成功、失败和 pending；需要统一消息时用 getErrorMessage，不能期待 reducer 错误 effect 自动弹提示。

上传 / 下载 / 临时链接沿用同一注入方式，参数、Content-Type 和返回类型以现有请求封装和接口为准。不要机械复制参考项目的上传头或业务地址。

创建实体再上传附件时，createActionAsync 成功取 `action.success.res.body.id`，后续普通 thunk 则取直接 res。创建成功、附件失败是部分成功：保留已创建 ID、告知可重试上传，不能再次创建实体，也不能用空 catch 吞掉上传失败。互不依赖的请求按需并行，依赖 ID 的操作必须顺序执行。

## 清理、退出与并发边界

模板适用于一个状态槽只有一份有效请求的基础流程。快速搜索、连续翻页、详情 A → B、父级选项切换或离开后重入，都可能产生旧响应覆盖新结果；遇到这些触发条件应补充请求归属保护。

- 不用 `if (isFetching) return` 阻止新的搜索，也不只在组件里 ignore 通知；旧响应仍可能写进 reducer。
- 默认 createActionAsync 的三阶段 action 没有 args / requestId。需要 reducer 判断新旧时，在对应模块用少量普通 thunk 显式派发同 type、subType，并给 REQUEST / SUCCESS / FAILURE 都附加 requestId；保持相同 Promise 返回约定便于调用方复用。
- REQUEST 保存最新 requestId；SUCCESS 和 FAILURE 在修改数据、pending、失败或通知之前先比较，过期 action 返回原 state。子列表 / 不同 key 分别比较自己的 requestId。
- 清理 / 切换实体时一并清空所属 requestId，避免旧请求清掉新 pending 或带来过期错误。后台请求取消是否支持需确认 request 的真实能力；不假设现有 Promise 带 abort。
- 所有模块通过现有 RESET_STATE 在退出时恢复初值。退出后的在途请求也可能返回，不能只依赖重置：会话敏感或需严格隔离的模块应同时核对请求归属 / 会话代次，不擅自更改公共鉴权来掩盖业务竞态。

不为普通请求统一搭建新的并发平台。只在需要的模块补足上述机制，并对逆序成功和逆序失败编写测试；若尚未实现，交付时说明不能承诺快速切换下的数据一致性。

## 错误反馈与现有能力边界

- 普通三阶段失败：reducer 用 getErrorMessage(action.err)，页面 effect Toast 一次并 clearError；列表 / 详情失败标记独立保留。初次进入清理过期通知，不能在 render Toast。
- 普通 thunk：由调用方处理原始错误，不能套 `.failure.err`。第三方或表单逻辑的错误同样按其实际形状处理。
- 服务器字段错误只有在接口和 request 实际传递时才能映射。当前 request 的业务错误标准化仅保留 status、statusText、errcode、errmsg；不要凭空解构 field_errors。确需字段级协议时先确认公共封装的适配范围和测试，再按 [表单规范](form-development.md#服务器错误) 映射已知字段，不绕过 request 重写鉴权。
- 参考项目中“清错误顺便重置 loading / 成功”、统一 isFetching 控制所有操作、整包遍历 body 写状态、未 catch 的 dispatch、失败后仍 resolve、旧路由与 Ant Design API 均不作为新模块模板。
- GettingStarted 是不需要接口状态的使用向导页，不创建 Redux 模块；新业务按本文和实际契约开发，不为统一写法重构现有鉴权流程。

## AI 完成清单

| 环节     | 核对                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 文件     | 领域正确，四文件按需创建，命名一致，UI 草稿没有无意义进入 Redux                    |
| 接口     | 方法、路径、qs / body、0 / false / 空值、请求参数顺序和响应契约确认                |
| 状态     | 初值完整，三个阶段结束 pending，列表 / 详情 / 提交互不混用，响应显式赋值           |
| 页面     | 注册 reducer / selector 对齐，路由与菜单按需接入，加载 / 失败 / 空 / 重试具备      |
| 操作     | 处理 reject，成功反馈只处理一次，保存失败保留输入，删除后保留查询并修正页码        |
| 生命周期 | 进入 / 切换 / 关闭的清理范围明确，旧成功不触发跳转，并发时防过期响应               |
| 验证     | 相关 reducer / selector / API 参数测试；重要流程 Playwright，缺后端使用同协议 Mock |

测试沿用现有 Vitest 配置与 Vite 别名；当前 redux-act-reducer 解析到安装包的 src，不另建一套模块解析或增补无关工具依赖。

按 [任务收尾检查](development.md#任务收尾检查) 执行适用检查。重点测试成功、失败、空数据、重复提交、返回列表条件保持、详情回填和实际存在的竞态；不只用静态源码检查证明行为正确。不默认 Git 提交或推送。
