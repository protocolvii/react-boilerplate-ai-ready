import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, KeyRound } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { setMainMenuCollapsed } from '../../containers/User/actions';
import { selectCollapsed } from '../../containers/User/selectors';
const MainMenu = () => {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectCollapsed);
  useEffect(() => {
    if (collapsed === undefined) dispatch(setMainMenuCollapsed(localStorage.getItem('main_menu_collapsed') === '1'));
  }, [collapsed, dispatch]);
  const toggle = () => {
    dispatch(setMainMenuCollapsed(!collapsed));
    localStorage.setItem('main_menu_collapsed', collapsed ? '0' : '1');
  };
  const items = [
    { to: '/', label: '控制台', icon: LayoutDashboard },
    { to: '/change-password', label: '修改密码', icon: KeyRound }
  ];
  return (
    <aside className={cn('fixed bottom-0 left-0 top-14 hidden flex-col border-r bg-background p-3 md:flex', collapsed ? 'w-20' : 'w-52')}>
      <nav className="flex-1 space-y-1" aria-label="主导航">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} end to={to} title={label} className={({ isActive }) => cn('flex h-10 items-center gap-3 rounded-md px-3 text-sm hover:bg-accent', isActive && 'bg-accent font-medium')}>
            <Icon className="size-4 shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
      <Button variant="ghost" onClick={toggle} aria-label={collapsed ? '展开菜单' : '收起菜单'} aria-expanded={!collapsed}>
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
    </aside>
  );
};
export default MainMenu;
