import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../../utils/cn';
import { setMainMenuCollapsed } from '../../containers/User/actions';
import { selectCollapsed } from '../../containers/User/selectors';
import { useLayout } from '../../design-system/layouts/context';
import Navigation from './Navigation';
import { menuItems } from './items';

const MainMenu = () => {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectCollapsed);
  const { mobileOpen, setMobileOpen } = useLayout();
  const location = useLocation();
  useEffect(() => {
    if (collapsed !== undefined) return;
    let stored = false;
    try {
      stored = localStorage.getItem('main_menu_collapsed') === '1';
    } catch {
      /* 使用默认展开状态。 */
    }
    dispatch(setMainMenuCollapsed(stored));
  }, [collapsed, dispatch]);
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, setMobileOpen]);
  const toggle = () => {
    dispatch(setMainMenuCollapsed(!collapsed));
    try {
      localStorage.setItem('main_menu_collapsed', collapsed ? '0' : '1');
    } catch {
      /* 不影响交互。 */
    }
  };
  const navigation = compact => <Navigation items={menuItems} compact={compact} location={location} onNavigate={() => setMobileOpen(false)} />;
  return (
    <>
      <aside
        className={cn(
          'fixed bottom-0 left-0 top-[var(--header-height)] ds-desktop-sidebar flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground',
          collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]'
        )}
      >
        {navigation(collapsed)}
        <Button variant="ghost" onClick={toggle} aria-label={collapsed ? '展开菜单' : '收起菜单'} aria-expanded={!collapsed}>
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {!collapsed && '收起导航'}
        </Button>
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent id="main-navigation-drawer" side="left" className="w-72 max-w-[calc(100vw-2rem)] bg-sidebar text-sidebar-foreground">
          <SheetHeader>
            <SheetTitle>工作区导航</SheetTitle>
            <SheetDescription>选择要访问的页面</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">{navigation(false)}</div>
        </SheetContent>
      </Sheet>
    </>
  );
};
export default MainMenu;
