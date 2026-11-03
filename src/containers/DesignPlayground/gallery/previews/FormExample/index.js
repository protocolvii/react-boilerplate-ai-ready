import React, { useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { DatePicker, FormBox } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getErrorMessage } from '@/utils/error';
import { formSchema, defaultValues } from './schema';
import { loadExample, saveExample } from './mock';

export default function FormExample({ loadRecord = loadExample, saveRecord = saveExample }) {
  const id = useId();
  const pending = useRef(false);
  const [scenario, setScenario] = useState('success');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm({ resolver: zodResolver(formSchema), defaultValues, mode: 'onSubmit', reValidateMode: 'onChange' });
  const { errors, isSubmitting } = form.formState;
  const busy = isSubmitting || loading;
  const blocked = busy || disabled;
  const controlProps = name => ({ id: `${id}-${name}`, 'aria-invalid': !!errors[name], 'aria-describedby': `${id}-${name}-description${errors[name] ? ` ${id}-${name}-error` : ''}` });

  const submit = async values => {
    form.clearErrors('root');
    try {
      const result = await saveRecord(values, scenario);
      if (result.fieldErrors && Object.keys(result.fieldErrors).length) {
        for (const [name, message] of Object.entries(result.fieldErrors)) {
          // 示例接口只约定 name 字段错误；未知字段不能被当作已处理而吞掉。
          if (name === 'name') {
            form.setError(name, { type: 'server', message });
            // 请求结束、fieldset 恢复可用后再聚焦服务器指出的字段。
            setTimeout(() => form.setFocus(name), 0);
          } else form.setError('root.server', { message: '服务器返回了未识别的字段错误，请检查提交内容' });
        }
        return;
      }
      form.reset(values);
      toast.success('配置保存成功');
    } catch (error) {
      // 整体失败保留在 Alert 中，不再重复 Toast。
      form.setError('root.server', { message: getErrorMessage(error, '保存失败，请重试') });
    }
  };
  const submitForm = async event => {
    event.preventDefault();
    if (pending.current || loading || disabled) return;
    // 同步锁覆盖 schema 校验和请求，避免重复事件提前结束 isSubmitting。
    pending.current = true;
    try {
      await form.handleSubmit(submit)(event);
    } finally {
      pending.current = false;
    }
  };
  const load = async () => {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    try {
      const record = await loadRecord();
      form.reset(record);
      toast.info('编辑数据已载入');
    } catch (error) {
      toast.error(getErrorMessage(error, '加载失败'));
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-[var(--layout-gap)]">
      <p className="text-sm text-muted-foreground">本地异步示例：配置协作空间的数量、类型和有效期，不调用业务 API。切换提交结果可体验不同反馈。</p>
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-full sm:w-52">
          <FieldLabel htmlFor={`${id}-scenario`}>模拟提交结果</FieldLabel>
          <select id={`${id}-scenario`} value={scenario} onChange={event => setScenario(event.target.value)} disabled={busy} className="h-[var(--control-height)] rounded-md border border-input bg-background px-3 text-sm">
            <option value="success">保存成功</option>
            <option value="failure">保存失败</option>
            <option value="field-error">服务器字段错误</option>
          </select>
        </Field>
        <Button type="button" variant="outline" disabled={busy} onClick={load}>
          {loading ? '载入中…' : '载入编辑数据'}
        </Button>
        <Button type="button" variant="outline" disabled={busy} aria-pressed={disabled} onClick={() => setDisabled(value => !value)}>
          {disabled ? '启用表单' : '禁用表单'}
        </Button>
        <Button type="button" variant="outline" onClick={() => toast.warning('示例警告：请核对配置的生效范围')}>
          警告提示
        </Button>
      </div>
      <FormBox>
        <form noValidate onSubmit={submitForm} aria-label="通用配置表单" aria-busy={busy}>
          <fieldset disabled={blocked} className="min-w-0 space-y-[var(--layout-gap)]">
            <legend className="mb-4 font-medium">通用配置</legend>
            <FieldGroup className="gap-[var(--layout-gap)]">
              <div className="grid gap-[var(--layout-gap)] sm:grid-cols-2">
                <Field className="gap-2">
                  <FieldLabel className="min-h-8" htmlFor={`${id}-name`}>
                    配置名称
                  </FieldLabel>
                  <div className="space-y-1">
                    <Input {...form.register('name')} {...controlProps('name')} autoComplete="off" aria-required="true" />
                    <div className="min-h-4">
                      <FieldError id={`${id}-name-error`} className="text-xs leading-4">
                        {errors.name?.message}
                      </FieldError>
                    </div>
                  </div>
                  <FieldDescription id={`${id}-name-description`}>2～40 个字符。</FieldDescription>
                </Field>
                <Field className="gap-2">
                  <div className="flex items-center gap-2">
                    <FieldLabel htmlFor={`${id}-capacity`}>配置数量</FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" size="icon-sm" variant="ghost" aria-label="数量说明">
                          <Info className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>团队配置至少需要 2 个名额。</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Input {...form.register('capacity')} {...controlProps('capacity')} type="number" step="1" aria-required="true" />
                    <div className="min-h-4">
                      <FieldError id={`${id}-capacity-error`} className="text-xs leading-4">
                        {errors.capacity?.message}
                      </FieldError>
                    </div>
                  </div>
                  <FieldDescription id={`${id}-capacity-description`}>1～100 的整数；团队配置至少为 2。</FieldDescription>
                </Field>
              </div>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-2">
                    <FieldLabel htmlFor={`${id}-category`}>配置类型</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange} disabled={blocked}>
                      <div className="space-y-1">
                        <SelectTrigger {...controlProps('category')} ref={field.ref} onBlur={field.onBlur} className="w-full" aria-required="true">
                          <SelectValue placeholder="请选择配置类型" />
                        </SelectTrigger>
                        <div className="min-h-4">
                          <FieldError id={`${id}-category-error`} className="text-xs leading-4">
                            {errors.category?.message}
                          </FieldError>
                        </div>
                      </div>
                      <SelectContent>
                        <SelectItem value="personal">个人</SelectItem>
                        <SelectItem value="team">团队</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription id={`${id}-category-description`}>类型决定最小配置数量。</FieldDescription>
                  </Field>
                )}
              />
              <div className="grid gap-[var(--layout-gap)] sm:grid-cols-2">
                {[
                  ['startDate', '开始日期'],
                  ['endDate', '结束日期']
                ].map(([name, label]) => (
                  <Controller
                    key={name}
                    name={name}
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-2">
                        <FieldLabel htmlFor={`${id}-${name}`}>{label}</FieldLabel>
                        <div className="space-y-1">
                          <DatePicker {...field} {...controlProps(name)} disabled={blocked} aria-required="true" />
                          <div className="min-h-4">
                            <FieldError id={`${id}-${name}-error`} className="text-xs leading-4">
                              {errors[name]?.message}
                            </FieldError>
                          </div>
                        </div>
                        <FieldDescription id={`${id}-${name}-description`}>{name === 'startDate' ? '选择配置生效日期。' : '不能早于开始日期。'}</FieldDescription>
                      </Field>
                    )}
                  />
                ))}
              </div>
              <Controller
                name="enabled"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Switch {...controlProps('enabled')} ref={field.ref} name={field.name} checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} disabled={blocked} />
                    <div>
                      <FieldLabel htmlFor={`${id}-enabled`}>启用配置</FieldLabel>
                      <FieldDescription id={`${id}-enabled-description`}>保存后允许使用此配置。</FieldDescription>
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
            {errors.root?.server && (
              <Alert variant="destructive">
                <AlertTitle>未能保存配置</AlertTitle>
                <AlertDescription>{errors.root.server.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={blocked}>
                {isSubmitting ? '保存中…' : '保存配置'}
              </Button>
              <Button type="button" variant="outline" disabled={blocked} onClick={() => form.reset()}>
                重置
              </Button>
              <Button type="button" variant="ghost" disabled={blocked} onClick={() => form.reset(defaultValues)}>
                新建配置
              </Button>
            </div>
          </fieldset>
        </form>
      </FormBox>
    </div>
  );
}
