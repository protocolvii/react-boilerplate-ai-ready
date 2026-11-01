import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Toaster } from '../../components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';

import { routes, renderRoutes } from '../../routes';
import { setNavigate } from '../../utils/navigation';

const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    setNavigate(navigate);
    return () => setNavigate(null);
  }, [navigate]);

  return children;
};

const Root = ({ store }) => (
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter>
        <>
          <NavigationProvider>{renderRoutes(routes)}</NavigationProvider>
          <Toaster theme="light" richColors closeButton />
        </>
      </BrowserRouter>
    </HelmetProvider>
  </Provider>
);

export default Root;
