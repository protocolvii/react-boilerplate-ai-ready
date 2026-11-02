import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import config from '../../config';
import { getLoginDestination } from '../../utils/navigation';
import { clearError, submit, login } from './actions';
import { selectError, selectSubmitting, selectToken, selectExp } from './selectors';

const Login = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [minimumExpiry] = useState(() => Date.now() + 20 * 60 * 1000);
  const err = useSelector(selectError);
  const submitting = useSelector(selectSubmitting);
  const accessToken = useSelector(selectToken);
  const expires = useSelector(selectExp);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (err) {
      toast.error(err);
      dispatch(clearError());
    }
  }, [dispatch, err]);

  const handleLogin = async v => {
    if (v.username && v.password) {
      dispatch(submit(true));
      try {
        await dispatch(login(v.username, v.password));
      } catch (e) {
        // Error state is handled by the auth reducer.
      }
    }
  };

  const onSubmit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get('username').trim()) {
      toast.error('请输入用户名');
      return;
    }
    handleLogin({ username: data.get('username').trim(), password: data.get('password') });
  };
  if (accessToken && !err && expires > minimumExpiry) return <Navigate to={getLoginDestination(location.state?.from)} replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Helmet title={`登录 - ${config.app.title}`} />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="break-all text-xl">{config.app.title}</CardTitle>
          <CardDescription>输入账号密码登录管理后台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" name="username" autoComplete="username" placeholder="请输入用户名" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="请输入密码" required />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? '登录中…' : '登录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
export default Login;
