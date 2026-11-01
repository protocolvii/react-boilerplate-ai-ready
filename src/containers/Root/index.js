import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Toaster } from '../../components/ui/sonner';
import { LayoutProvider } from '../../design-system/layouts';
import { AppearanceProvider, useAppearance } from '../../design-system/appearance';
import { TooltipProvider } from '../../components/ui/tooltip';
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
      <LayoutProvider>
        <TooltipProvider delayDuration={250}>
          <HelmetProvider>
            <BrowserRouter>
              <>
                <NavigationProvider>
                  <Suspense
                    fallback={
                      <p role="status" className="p-8 text-sm text-muted-foreground">
                        加载页面…
                      </p>
                    }
                  >
                    {renderRoutes(routes)}
                  </Suspense>
                </NavigationProvider>
                <AppearanceToaster />
              </>
            </BrowserRouter>
          </HelmetProvider>
        </TooltipProvider>
      </LayoutProvider>
    </AppearanceProvider>
  </Provider>
);

export default Root;
