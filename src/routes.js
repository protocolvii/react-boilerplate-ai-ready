import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { App, DesignPlayground, PrivateRoute, Start, GettingStarted, NotFound, Login, ChangePassword } from './containers';

export const routes = [
  {
    path: '/*',
    component: App,
    routes: [
      { path: '/', component: import.meta.env.DEV ? GettingStarted : Start, needAuth: true },
      { path: '/change-password', component: ChangePassword, needAuth: true },
      { path: '/login', component: Login },
      ...(import.meta.env.DEV
        ? [
            { path: '/design-playground', component: DesignPlayground },
            { path: '/getting-started', component: GettingStarted, needAuth: true }
          ]
        : []),
      { path: '*', component: NotFound }
    ]
  }
];

export const renderRoutes = routesList => {
  const list = routesList ? (
    <Routes>
      {routesList.map((route, i) => {
        const Component = route.component;

        if (route.needAuth) {
          return <Route key={i} path={route.path} element={<PrivateRoute route={route} />} />;
        }

        return <Route key={i} path={route.path} element={<Component route={route} />} />;
      })}
    </Routes>
  ) : null;
  return list;
};
