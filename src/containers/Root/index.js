import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Toaster } from '../../components/ui/sonner';
import { AppearanceProvider, useAppearance } from '../../design-system/appearance';
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

const AppearanceToaster = () => {
  const { resolvedMode } = useAppearance();
  return <Toaster theme={resolvedMode} richColors closeButton />;
};

const Root = ({ store }) => (
  <Provider store={store}>
    <AppearanceProvider>
      <HelmetProvider>
        <BrowserRouter>
          <>
            <NavigationProvider>{renderRoutes(routes)}</NavigationProvider>
            <AppearanceToaster />
          </>
        </BrowserRouter>
      </HelmetProvider>
    </AppearanceProvider>
  </Provider>
);

export default Root;
