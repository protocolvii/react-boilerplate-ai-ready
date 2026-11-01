import { lazy } from 'react';
import App from './App';
import Home from './Home';
import NotFound from './NotFound';
import Login from './Auth';
import PrivateRoute from './PrivateRoute';
import ChangePassword from './Auth/ChangePassword';

const DesignPlayground = lazy(() => import('./DesignPlayground'));

export { DesignPlayground, App, Home, NotFound, Login, PrivateRoute, ChangePassword };
