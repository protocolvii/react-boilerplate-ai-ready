import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { App, DesignPlayground, PrivateRoute, Home, NotFound, Login, ChangePassword } from './containers';

export const routes = [
  {
    path: '/*',
    component: App,
    routes: [
      { path: '/', component: Home, needAuth: true },
      { path: '/change-password', component: ChangePassword, needAuth: true },
      { path: '/login', component: Login },
      { path: '/design-playground', component: DesignPlayground },
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
