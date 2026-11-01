import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, KeyRound, User, Menu, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { logout } from '../../containers/Auth/actions';
import { getMyInfo } from '../../containers/User/actions';
import { selectUser } from '../../containers/User/selectors';
import config from '../../config';
import { getOrRefreshToken } from '../../utils/auth';
import { selectToken } from '../../containers/Auth/selectors';
import { useLayout } from '../../design-system/layouts/context';
const MainHeader = () => {
  const { setMobileOpen } = useLayout();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const store = useStore();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [restoringAuth, setRestoringAuth] = useState(!token);
  useEffect(() => {
    let active = true;
    // 公开页面不会经过 PrivateRoute，也需要从已有缓存恢复登录态。
    getOrRefreshToken(dispatch, store.getState, { isFresh: false })
      .catch(() => {
        // 无会话时继续公开浏览，不强制跳转登录。
      })
      .finally(() => {
        if (active) setRestoringAuth(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch, store]);
  useEffect(() => {
    if (token && !user.id && !user.hasRequestedMyInfo) dispatch(getMyInfo()).catch(() => {});
  }, [dispatch, token, user.id, user.hasRequestedMyInfo]);
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--header-height)] items-center justify-between gap-3 border-b bg-card px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setMobileOpen(true)} aria-label="打开导航">
          <Menu />
        </Button>
        <Link to="/" className="truncate text-base font-semibold md:text-lg">
          {config.app.title}
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {import.meta.env.DEV && (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/design-playground" aria-label="设计系统" title="设计系统（开发工具）">
              <Palette className="size-4" />
            </Link>
          </Button>
        )}
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
        ) : restoringAuth ? (
          <span role="status" className="text-xs text-muted-foreground">
            正在恢复登录状态…
          </span>
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
