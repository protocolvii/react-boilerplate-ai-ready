import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Field, FieldLabel, FieldError } from '../../../components/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../schema';
import { clearError, changePassword } from '../actions';
import { selectError, selectSubmitting, selectOptSuccess } from '../selectors';
import { MainHeader, MainMenu, PageHeader, PageContent, FormBox, MainPage, PageSection } from '../../../components';
import config from '../../../config';
import styles from './styles.css';
const ChangePassword = () => {
  const pending = useRef(false);
  const form = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { oldpassword: '', password: '', repassword: '' }, mode: 'onSubmit', reValidateMode: 'onChange' });
  const { errors, isSubmitting } = form.formState;
  const { reset } = form;
  const dispatch = useDispatch();
  const err = useSelector(selectError);
  const submitting = useSelector(selectSubmitting);
  const optSuccess = useSelector(selectOptSuccess);
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
      reset();
      dispatch(clearError());
    }
  }, [dispatch, optSuccess, reset]);
  const save = async values => {
    try {
      await dispatch(changePassword(values.oldpassword, values.password, values.repassword));
    } catch {
      /* reducer 和错误 effect 负责反馈 */
    }
  };
  const onSubmit = async event => {
    event.preventDefault();
    if (pending.current || submitting) return;
    pending.current = true;
    try {
      await form.handleSubmit(save)(event);
    } finally {
      pending.current = false;
    }
  };
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Helmet title={`修改密码 - ${config.app.title}`} />
      <MainHeader />
      <MainMenu />
      <MainPage fill>
        <PageHeader breadcrumb={[{ name: '首页', link: '/' }, { name: '修改密码' }]} title="修改密码" />
        <PageContent fill>
          <PageSection fill>
            <div className={styles.formPlacement}>
              <FormBox>
                <form noValidate onSubmit={onSubmit} className="space-y-3 pb-4" aria-busy={submitting || isSubmitting}>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="oldpassword">原密码</FieldLabel>
                    <div className="space-y-1">
                      <Input
                        {...form.register('oldpassword')}
                        id="oldpassword"
                        type="password"
                        autoComplete="current-password"
                        aria-required="true"
                        aria-invalid={!!errors.oldpassword}
                        aria-describedby={errors.oldpassword ? 'oldpassword-error' : undefined}
                      />
                      <div className="min-h-4">
                        <FieldError id="oldpassword-error" className="text-xs leading-4">
                          {errors.oldpassword?.message}
                        </FieldError>
                      </div>
                    </div>
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="new-password">新密码</FieldLabel>
                    <div className="space-y-1">
                      <Input
                        {...form.register('password')}
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        aria-required="true"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'new-password-error' : undefined}
                        placeholder="6～20 位密码"
                      />
                      <div className="min-h-4">
                        <FieldError id="new-password-error" className="text-xs leading-4">
                          {errors.password?.message}
                        </FieldError>
                      </div>
                    </div>
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="repassword">确认新密码</FieldLabel>
                    <div className="space-y-1">
                      <Input {...form.register('repassword')} id="repassword" type="password" autoComplete="new-password" aria-required="true" aria-invalid={!!errors.repassword} aria-describedby={errors.repassword ? 'repassword-error' : undefined} />
                      <div className="min-h-4">
                        <FieldError id="repassword-error" className="text-xs leading-4">
                          {errors.repassword?.message}
                        </FieldError>
                      </div>
                    </div>
                  </Field>
                  <div className="pt-1">
                    <Button type="submit" disabled={submitting || isSubmitting}>
                      {submitting || isSubmitting ? '提交中…' : '提交'}
                    </Button>
                  </div>
                </form>
              </FormBox>
            </div>
          </PageSection>
        </PageContent>
      </MainPage>
    </div>
  );
};
export default ChangePassword;
