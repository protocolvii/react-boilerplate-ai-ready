import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { clearError, changePassword } from '../actions';
import { selectError, selectSubmitting, selectOptSuccess } from '../selectors';
import { MainHeader, MainMenu, PageHeader, PageContent, FormBox, MainPage, PageSection } from '../../../components';
import config from '../../../config';
const ChangePassword = () => {
  const formRef = useRef(null);
  const dispatch = useDispatch();
  const err = useSelector(selectError);
  const submitting = useSelector(selectSubmitting);
  const optSuccess = useSelector(selectOptSuccess);
  const [formError, setFormError] = useState('');
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  useEffect(() => {
    if (err) {
      toast.error(err);
      dispatch(clearError());
    }
  }, [dispatch, err]);
  useEffect(() => {
    if (optSuccess) {
      toast.success('密码修改成功');
      setFormError('');
      formRef.current?.reset();
      dispatch(clearError());
    }
  }, [dispatch, optSuccess]);
  const onSubmit = async event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.password !== values.repassword) {
      setFormError('两次密码输入不一致');
      return;
    }
    setFormError('');
    try {
      await dispatch(changePassword(values.oldpassword, values.password, values.repassword));
    } catch {
      /* reducer handles API errors */
    }
  };
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Helmet title={`修改密码 - ${config.app.title}`} />
      <MainHeader />
      <MainMenu />
      <MainPage>
        <PageHeader breadcrumb={[{ name: '首页', link: '/' }, { name: '修改密码' }]} title="修改密码" />
        <PageContent>
          <PageSection>
            <FormBox>
              <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="oldpassword">原密码</Label>
                  <Input id="oldpassword" name="oldpassword" type="password" autoComplete="current-password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input id="new-password" name="password" type="password" minLength={6} maxLength={20} autoComplete="new-password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repassword">确认新密码</Label>
                  <Input id="repassword" name="repassword" type="password" minLength={6} maxLength={20} autoComplete="new-password" aria-invalid={!!formError} aria-describedby={formError ? 'password-error' : undefined} required />
                </div>
                {formError && (
                  <p id="password-error" role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? '提交中…' : '提交'}
                </Button>
              </form>
            </FormBox>
          </PageSection>
        </PageContent>
      </MainPage>
    </div>
  );
};
export default ChangePassword;
