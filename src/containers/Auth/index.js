import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Field, FieldLabel, FieldError } from '../../components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from './schema';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import config from '../../config';
import BrandIdentity from '../../components/BrandIdentity';
import { getLoginDestination } from '../../utils/navigation';
import { clearError, submit, login } from './actions';
import { selectError, selectSubmitting, selectToken, selectExp } from './selectors';

const Login = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const pending = useRef(false);
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { username: '', password: '' }, mode: 'onSubmit', reValidateMode: 'onChange' });
  const { errors, isSubmitting } = form.formState;
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

  const handleLogin = async values => {
    dispatch(submit(true));
    try {
      await dispatch(login(values.username, values.password));
    } catch {
      // reducer 和错误 effect 统一处理服务端错误。
    }
  };
  const onSubmit = async event => {
    event.preventDefault();
    if (pending.current || submitting) return;
    pending.current = true;
    try {
      await form.handleSubmit(handleLogin)(event);
    } finally {
      pending.current = false;
    }
  };
  if (accessToken && !err && expires > minimumExpiry) return <Navigate to={getLoginDestination(location.state?.from)} replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Helmet title={`登录 - ${config.app.title}`} />
      <Card className="w-full max-w-sm">
        <CardHeader className="grid-rows-1 pb-5">
          <CardTitle className="text-xl">
            <BrandIdentity logoSize={config.app.logoSize + 4} className="justify-center text-center" textClassName="whitespace-normal break-words" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={onSubmit} className="space-y-3 pb-4" aria-busy={submitting || isSubmitting}>
            <Field className="gap-2">
              <FieldLabel htmlFor="username">用户名</FieldLabel>
              <div className="space-y-1">
                <Input {...form.register('username')} id="username" autoComplete="username" placeholder="请输入用户名" aria-required="true" aria-invalid={!!errors.username} aria-describedby={errors.username ? 'username-error' : undefined} />
                <div className="min-h-4">
                  <FieldError id="username-error" className="text-xs leading-4">
                    {errors.username?.message}
                  </FieldError>
                </div>
              </div>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <div className="space-y-1">
                <Input
                  {...form.register('password')}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <div className="min-h-4">
                  <FieldError id="password-error" className="text-xs leading-4">
                    {errors.password?.message}
                  </FieldError>
                </div>
              </div>
            </Field>
            <div className="pt-1">
              <Button type="submit" disabled={submitting || isSubmitting} className="w-full">
                {submitting || isSubmitting ? '登录中…' : '登录'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
export default Login;
