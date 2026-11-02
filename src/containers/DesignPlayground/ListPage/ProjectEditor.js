import React, { useId, useState } from 'react';
import { DatePicker } from '../../../components';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { getErrorMessage } from '../../../utils/error';
import { projectTypes, teams, projectStatuses } from './data';

export default function ProjectEditor({ project, onClose, onSave }) {
  const id = useId();
  const [values, setValues] = useState(project);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const update = (key, value) => {
    setValues(current => ({ ...current, [key]: value }));
    setError('');
  };
  const choices = [
    { key: 'type', label: '项目类型', options: projectTypes.map(value => ({ value, label: value })) },
    { key: 'team', label: '所属团队', options: teams.map(value => ({ value, label: value })) },
    { key: 'status', label: '状态', options: Object.entries(projectStatuses).map(([value, item]) => ({ value, label: item.label })) }
  ];
  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{project.id ? '编辑项目' : '新增项目'}</DialogTitle>
          <DialogDescription>修改仅用于当前模板预览，刷新页面后恢复示例数据。</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={async event => {
            event.preventDefault();
            if (pending) return;
            if (!values.name.trim() || !values.owner.trim()) {
              setError('请填写项目名称和负责人。');
              return;
            }
            setPending(true);
            try {
              await onSave({ ...values, name: values.name.trim(), owner: values.owner.trim() });
            } catch (err) {
              setError(getErrorMessage(err, '保存失败，请重试。'));
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>项目名称</Label>
            <Input
              id={`${id}-name`}
              name="name"
              aria-invalid={(!!error && !values.name.trim()) || undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              value={values.name}
              onChange={event => update('name', event.target.value)}
              required
              maxLength={120}
              disabled={pending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {choices.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`${id}-${field.key}`}>{field.label}</Label>
                <Select name={field.key} value={values[field.key]} disabled={pending} onValueChange={value => update(field.key, value)}>
                  <SelectTrigger id={`${id}-${field.key}`} className="w-full" aria-describedby={error ? `${id}-error` : undefined}>
                    <SelectValue placeholder={`请选择${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor={`${id}-owner`}>负责人</Label>
              <Input
                id={`${id}-owner`}
                name="owner"
                aria-invalid={(!!error && !values.owner.trim()) || undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                value={values.owner}
                onChange={event => update('owner', event.target.value)}
                required
                maxLength={40}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-date`}>更新日期</Label>
              <DatePicker id={`${id}-date`} name="updated" value={values.updated} onChange={value => update('updated', value)} disabled={pending} />
            </div>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="text-sm text-status-error">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? '保存中…' : '保存项目'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
