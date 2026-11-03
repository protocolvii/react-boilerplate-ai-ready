import React, { useId, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { ValidationPopover, DatePicker, ProgressBar, PageHeader, SectionHeader, MetricCard, EmptyState, SearchToolbar, FilterBar, DataTable, Pagination, ConfirmDialog } from '../../../../components';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import FormExample from './FormExample';

export function HeaderPreview() {
  return <PageHeader title="项目管理" info="标题、面包屑与操作区组合。" breadcrumb={[{ name: '项目管理' }]} actions={<Button variant="outline">导出</Button>} />;
}
export function SectionPreview() {
  return (
    <SectionHeader
      title="运行概览"
      description="用于页面内部的信息分区。"
      actions={
        <Button variant="outline" size="sm">
          查看全部
        </Button>
      }
    />
  );
}
export function MetricPreview() {
  return (
    <div className="grid gap-[var(--layout-gap)] sm:grid-cols-2">
      <MetricCard label="在线设备" value="128" detail="较昨日增加 6 台" icon={Activity} />
      <MetricCard label="告警数量" value="02" detail="需要人工确认" />
    </div>
  );
}
export function EmptyPreview() {
  const [message, setMessage] = useState('');
  return (
    <>
      <EmptyState title="暂无记录" description="添加第一条记录开始使用。" actions={<Button onClick={() => setMessage('已触发新增操作，本示例不调用 API。')}>新增记录</Button>} />
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </>
  );
}
export function SearchPreview() {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  return (
    <div className="space-y-4">
      <SearchToolbar value={draft} onChange={setDraft} onSubmit={() => setQuery(draft.trim())} />
      <FilterBar summary={query ? `当前查询：${query}` : '尚未设置查询条件'}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDraft('');
            setQuery('');
          }}
        >
          清除条件
        </Button>
      </FilterBar>
    </div>
  );
}
const rows = [
  { id: 'A01', name: '设备运行概览', count: 128 },
  { id: 'A02', name: '告警处理记录', count: 2 },
  { id: 'A03', name: '离线设备清单', count: 4 }
];
export function TablePreview() {
  const id = useId();
  const [mode, setMode] = useState('ready');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(2);
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
  const ordered = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN') * (sort.direction === 'asc' ? 1 : -1));
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor={id}>表格示例状态</Label>
        <select id={id} value={mode} onChange={event => setMode(event.target.value)} className="rounded-md border bg-background p-2 text-sm">
          <option value="ready">有数据</option>
          <option value="empty">空数据</option>
          <option value="loading">加载中</option>
          <option value="error">请求失败</option>
        </select>
      </div>
      {mode === 'error' ? (
        <p role="alert" className="text-sm text-destructive">
          示例请求失败，请重试。
        </p>
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: '名称', sortable: true },
            { key: 'count', header: '数量', className: 'sticky right-0 bg-card', headerClassName: 'sticky right-0 bg-muted' }
          ]}
          rows={mode === 'empty' ? [] : ordered.slice((page - 1) * perPage, page * perPage)}
          sort={sort}
          onSort={setSort}
          loading={mode === 'loading'}
          caption="通用数据表格与受控排序示例"
        />
      )}
      {mode === 'ready' && (
        <Pagination
          page={page}
          perPage={perPage}
          total={rows.length}
          onChange={(next, size) => {
            setPage(next);
            setPerPage(size);
          }}
        />
      )}
    </div>
  );
}
export function ConfirmPreview() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [fail, setFail] = useState(false);
  const id = useId();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          打开确认对话框
        </Button>
        <label htmlFor={id} className="flex items-center gap-2 text-sm">
          <input id={id} type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} />
          模拟失败
        </label>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        已确认 {count} 次
      </p>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="确认执行示例操作？"
        description="仅更新本地计数，不调用业务接口。"
        onConfirm={() => {
          if (fail) throw new Error('preview failure');
          setCount(current => current + 1);
        }}
      />
    </div>
  );
}
export function FormPreview() {
  return <FormExample />;
}

export function DatePickerPreview() {
  const id = useId();
  const [date, setDate] = useState('');
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${id}-date`}>选择日期</Label>
        <DatePicker id={`${id}-date`} value={date} onChange={setDate} />
        <p className="text-sm text-muted-foreground">{date || '尚未选择日期'}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-end`}>结束日期（不早于所选日期）</Label>
        <DatePicker id={`${id}-end`} min={date || undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-disabled`}>禁用日期</Label>
        <DatePicker id={`${id}-disabled`} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-invalid`}>日期错误示例</Label>
        <DatePicker id={`${id}-invalid`} aria-invalid="true" aria-describedby={`${id}-error`} />
        <p id={`${id}-error`} className="text-sm text-destructive">
          示例：请选择有效的业务日期。
        </p>
      </div>
      <p className="text-sm text-muted-foreground sm:col-span-2">基于 shadcn Calendar 与 Popover，支持中文日历、年月切换和清空日期。</p>
    </div>
  );
}
export function ProgressPreview() {
  const id = useId();
  const [value, setValue] = useState(45);
  return (
    <div className="max-w-md space-y-5">
      <div className="space-y-2">
        <Label htmlFor={id}>调整完成进度</Label>
        <input id={id} type="range" min="0" max="100" value={value} onChange={event => setValue(Number(event.target.value))} className="w-full accent-primary" />
        <ProgressBar value={value} label="完成进度" />
      </div>
      <ProgressBar value={0} label="尚未开始" />
      <ProgressBar value={100} label="已完成" />
      <ProgressBar value={null} label="等待处理结果" />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">隐藏百分比文字</p>
        <ProgressBar value={65} showValue={false} label="后台任务进度" />
      </div>
    </div>
  );
}

export function ValidationPreview() {
  const id = useId();
  const input = useRef(null);
  const [value, setValue] = useState('');
  const [attempt, setAttempt] = useState(0);
  const message = attempt && value.trim().length < 2 ? '请输入至少 2 个字符' : '';
  return (
    <form
      noValidate
      className="flex flex-wrap items-end gap-3"
      onSubmit={event => {
        event.preventDefault();
        setAttempt(value => value + 1);
        if (value.trim().length < 2) input.current?.focus();
      }}
    >
      <div className="min-w-0 space-y-2">
        <Label htmlFor={id}>校验气泡示例</Label>
        <ValidationPopover message={message} attempt={attempt}>
          <Input id={id} ref={input} value={value} onChange={event => setValue(event.target.value)} placeholder="输入至少 2 个字符" />
        </ValidationPopover>
      </div>
      <Button type="submit">检查输入</Button>
      <p className="w-full text-sm text-muted-foreground">错误浮层不占空间；聚焦错误字段查看，Escape 或点击其他区域关闭，再次提交可重新提示。</p>
    </form>
  );
}
