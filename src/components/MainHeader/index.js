import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, KeyRound, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { logout } from '../../containers/Auth/actions';
import { getMyInfo } from '../../containers/User/actions';
import { selectUser } from '../../containers/User/selectors';
import config from '../../config';
import { AppearanceMenu } from '../../design-system/components';
import { selectToken } from '../../containers/Auth/selectors';
import { useLayout } from '../../design-system/layouts/context';
const MainHeader = () => {
  const { setMobileOpen } = useLayout();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  useEffect(() => {
    if (token && !user.id && !user.hasRequestedMyInfo) dispatch(getMyInfo()).catch(() => {});
  }, [dispatch, token, user.id, user.hasRequestedMyInfo]);
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--header-height)] items-center justify-between gap-3 border-b bg-card px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setMobileOpen(true)} aria-label="打开导航">
          <Menu />
        </Button>
        <Link to="/" className="truncate text-sm font-semibold">
          {config.app.title}
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <AppearanceMenu />
        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <User className="size-4" />
                {user.username || 'admin'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => navigate('/change-password')}>
                <KeyRound />
                修改密码
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => dispatch(logout()).catch(() => {})}>
                <LogOut />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">登录</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
export default MainHeader;
