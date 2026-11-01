import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, KeyRound, User } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { logout } from '../../containers/Auth/actions';
import { getMyInfo } from '../../containers/User/actions';
import { selectUser } from '../../containers/User/selectors';
import config from '../../config';
const MainHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  useEffect(() => {
    if (!user.id && !user.hasRequestedMyInfo) dispatch(getMyInfo()).catch(() => {});
  }, [dispatch, user.id, user.hasRequestedMyInfo]);
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
      <Link to="/" className="truncate text-sm font-semibold">
        {config.app.title}
      </Link>
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
    </header>
  );
};
export default MainHeader;
