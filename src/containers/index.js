import { lazy } from 'react';
import App from './App';
import Start from './Start';
import NotFound from './NotFound';
import Login from './Auth';
import PrivateRoute from './PrivateRoute';
import ChangePassword from './Auth/ChangePassword';

const GettingStarted = import.meta.env.DEV ? lazy(() => import('./GettingStarted')) : null;
const DesignPlayground = import.meta.env.DEV ? lazy(() => import('./DesignPlayground')) : null;

export { DesignPlayground, App, Start, GettingStarted, NotFound, Login, PrivateRoute, ChangePassword };
