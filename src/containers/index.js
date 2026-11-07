import { lazy } from 'react';
import App from './App';
import Start from './Start';
import PrivateRoute from './PrivateRoute';

// 路由级代码分割：首屏（App 壳、鉴权逻辑、Start 落地页）保持 eager，
// 非首屏页面容器按需加载。Start 只有 0.59KB，lazy 它反而多一次请求。
// Root 组件已用 Suspense 包裹 renderRoutes，fallback 为“加载页面…”。
// 新增生产路由时，重页面 / 低频页面加到下面的 lazy 列表里，小页面与首屏入口保持 eager。
const NotFound = lazy(() => import('./NotFound'));
const Login = lazy(() => import('./Auth'));
const ChangePassword = lazy(() => import('./Auth/ChangePassword'));

const GettingStarted = import.meta.env.DEV ? lazy(() => import('./GettingStarted')) : null;
const DesignPlayground = import.meta.env.DEV ? lazy(() => import('./DesignPlayground')) : null;

export { DesignPlayground, App, Start, GettingStarted, NotFound, Login, PrivateRoute, ChangePassword };
