import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, KeyRound, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { cn } from '../../utils/cn';
import { setMainMenuCollapsed } from '../../containers/User/actions';
import { selectCollapsed } from '../../containers/User/selectors';
import { useLayout } from '../../design-system/layouts/context';

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
  }, [location.pathname, setMobileOpen]);
  const toggle = () => {
    dispatch(setMainMenuCollapsed(!collapsed));
    try {
      localStorage.setItem('main_menu_collapsed', collapsed ? '0' : '1');
    } catch {
      /* 不影响交互。 */
    }
  };
  const items = [
    { to: '/', label: '控制台', icon: LayoutDashboard },
    { to: '/design-playground', label: '设计系统', icon: Palette },
    { to: '/change-password', label: '修改密码', icon: KeyRound, Palette }
  ];
  const navigation = compact => (
    <nav className="flex-1 space-y-1" aria-label="主导航">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          end
          to={to}
          title={label}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn('flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', isActive && 'bg-sidebar-accent font-semibold text-sidebar-primary')
          }
        >
          <Icon className="size-4 shrink-0" />
          {!compact && label}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <>
      <aside
        className={cn('fixed bottom-0 left-0 top-[var(--header-height)] hidden flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground md:flex', collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]')}
      >
        {!collapsed && <div className="px-3 pb-3 pt-2 text-xs font-medium tracking-wider text-muted-foreground">工作空间</div>}
        {navigation(collapsed)}
        <Button variant="ghost" onClick={toggle} aria-label={collapsed ? '展开菜单' : '收起菜单'} aria-expanded={!collapsed}>
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {!collapsed && '收起导航'}
        </Button>
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 max-w-[calc(100vw-2rem)] bg-sidebar text-sidebar-foreground">
          <SheetHeader>
            <SheetTitle>工作区导航</SheetTitle>
            <SheetDescription>选择要访问的页面</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col p-4">{navigation(false)}</div>
        </SheetContent>
      </Sheet>
    </>
  );
};
export default MainMenu;
