import React, { useId, useMemo, useRef, useState } from 'react';
import { Search, RotateCcw, Plus, MoreHorizontal, ChevronDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeader, DataTable, Pagination, ConfirmDialog, StatusIndicator } from '../../../components';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../../../components/ui/dropdown-menu';
import ProjectEditor from './ProjectEditor';
import styles from './styles.css';
import { initialProjects, emptyFilters, projectTypes, teams, projectStatuses, filterProjects } from './data';

function FilterField({ label, id, children }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Label htmlFor={id} className="shrink-0">
        {label}
      </Label>
      {children}
    </div>
  );
}
export default function ListPage() {
  const id = useId();
  const nextId = useRef(initialProjects.length + 1);
  const [projects, setProjects] = useState(() => initialProjects.map(project => ({ ...project })));
  const [draft, setDraft] = useState({ ...emptyFilters });
  const [query, setQuery] = useState({ ...emptyFilters });
  const [filterError, setFilterError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editor, setEditor] = useState(null);
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const filtered = useMemo(() => {
    const rows = filterProjects(projects, query);
    return sort ? rows.sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key]), 'zh-CN') * (sort.direction === 'asc' ? 1 : -1)) : rows;
  }, [projects, query, sort]);
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)));
  const update = (key, value) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setFilterError('');
  };
  const advancedCount = Object.keys(emptyFilters).filter(key => key !== 'name' && query[key] !== undefined && query[key] !== emptyFilters[key]).length;
  const reset = () => {
    setFiltersOpen(false);
    setFilterError('');
    setDraft({ ...emptyFilters });
    setQuery({ ...emptyFilters });
    setPage(1);
  };
  const fields = [
    { key: 'type', label: '项目类型', options: projectTypes.map(value => ({ value, label: value })) },
    { key: 'team', label: '所属团队', options: teams.map(value => ({ value, label: value })) },
    { key: 'status', label: '状态', options: Object.entries(projectStatuses).map(([value, item]) => ({ value, label: item.label })) }
  ];
  const columns = [
    {
      key: 'name',
      header: '项目名称',
      sortable: true,
      className: `${styles.nameColumn} sticky left-0 z-10 w-36 min-w-36 border-r bg-card sm:w-56 sm:min-w-56`,
      headerClassName: `${styles.nameColumn} sticky left-0 z-20 w-36 min-w-36 border-r bg-muted sm:w-56 sm:min-w-56`,
      render: row => (
        <span className="block w-28 truncate sm:w-48" title={row.name}>
          {row.name}
        </span>
      )
    },
    { key: 'id', header: '项目编号', className: 'min-w-36', render: row => <span className="font-mono text-xs">{row.id}</span> },
    { key: 'type', header: '项目类型', className: 'min-w-28' },
    { key: 'team', header: '所属团队', className: 'min-w-36' },
    { key: 'status', header: '状态', className: 'min-w-28', render: row => <StatusIndicator {...projectStatuses[row.status]} /> },
    { key: 'owner', header: '负责人', className: 'min-w-24' },
    { key: 'priority', header: '优先级', className: 'min-w-28', render: row => <StatusIndicator label={row.priority || '普通'} tone={row.priority === '紧急' ? 'error' : row.priority === '较高' ? 'warning' : 'neutral'} /> },
    {
      key: 'progress',
      header: '完成进度',
      className: 'min-w-44',
      render: row => (
        <div className="flex items-center gap-3">
          <div role="progressbar" aria-label={`${row.name}完成进度`} aria-valuenow={row.progress ?? 0} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${row.progress ?? 0}%` }} />
          </div>
          <span className="tabular-nums">{row.progress ?? 0}%</span>
        </div>
      )
    },
    { key: 'created', header: '创建日期', sortable: true, className: 'min-w-36', render: row => <span className="tabular-nums">{row.created || '—'}</span> },
    { key: 'deadline', header: '截止日期', sortable: true, className: 'min-w-36', render: row => <span className="tabular-nums">{row.deadline || '—'}</span> },
    {
      key: 'notes',
      header: '备注',
      className: 'min-w-64',
      render: row => (
        <span className="block max-w-64 truncate" title={row.notes}>
          {row.notes || '—'}
        </span>
      )
    },
    { key: 'updated', header: '更新日期', sortable: true, className: 'min-w-36', render: row => <span className="tabular-nums">{row.updated || '—'}</span> },
    {
      key: 'actions',
      header: '操作',
      className: `${styles.actionColumn} sticky right-0 z-10 border-l bg-card`,
      headerClassName: `${styles.actionColumn} sticky right-0 z-20 border-l bg-muted`,
      render: row => (
        <>
          <div className={`${styles.desktopActions} items-center gap-3`}>
            <Button variant="link" size="sm" className="h-auto p-0 font-normal text-foreground" aria-label={`详情：${row.name}（${row.id}）`} onClick={() => setDetail(row)}>
              详情
            </Button>
            <Button variant="link" size="sm" className="h-auto p-0 font-normal text-foreground" aria-label={`编辑：${row.name}（${row.id}）`} onClick={() => setEditor(row)}>
              编辑
            </Button>
            <Button variant="link" size="sm" className="h-auto p-0 font-normal text-status-error" aria-label={`删除：${row.name}（${row.id}）`} onClick={() => setDeleting(row)}>
              删除
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" className={styles.mobileOnly} aria-label={`更多操作：${row.name}（${row.id}）`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setDetail(row)}>
                <Eye />
                详情
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEditor(row)}>
                <Pencil />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-status-error focus:text-status-error" onSelect={() => setDeleting(row)}>
                <Trash2 />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )
    }
  ];
  return (
    <div className="min-w-0 space-y-[var(--layout-gap)]">
      <form
        aria-label="项目筛选"
        className="ds-panel flex flex-wrap items-center gap-x-5 gap-y-4 p-[var(--panel-space)]"
        onSubmit={event => {
          event.preventDefault();
          if (draft.createdFrom && draft.createdTo && draft.createdFrom > draft.createdTo) {
            setFiltersOpen(true);
            setFilterError('创建日期的开始日期不能晚于结束日期。');
            return;
          }
          setFilterError('');
          setQuery({ ...draft, name: draft.name.trim(), id: (draft.id || '').trim(), owner: (draft.owner || '').trim() });
          setFiltersOpen(false);
          setPage(1);
        }}
      >
        <FilterField label="项目名称" id={`${id}-name`}>
          <Input id={`${id}-name`} value={draft.name} onChange={event => update('name', event.target.value)} placeholder="请输入项目名称" className="w-full sm:w-36" />
        </FilterField>
        <div id={`${id}-advanced-filters`} className={`${styles.advancedFilters} ${filtersOpen ? styles.expanded : ''}`}>
          {[
            { key: 'id', label: '项目编号', placeholder: '如 ITEM-001' },
            { key: 'owner', label: '负责人', placeholder: '请输入负责人' }
          ].map(field => (
            <FilterField key={field.key} label={field.label} id={`${id}-${field.key}`}>
              <Input id={`${id}-${field.key}`} value={draft[field.key] || ''} onChange={event => update(field.key, event.target.value)} placeholder={field.placeholder} className="w-full sm:w-36" />
            </FilterField>
          ))}
          {fields.map(field => (
            <FilterField key={field.key} label={field.label} id={`${id}-${field.key}`}>
              <Select value={draft[field.key] ?? 'all'} disabled={field.disabled} onValueChange={value => update(field.key, value)}>
                <SelectTrigger id={`${id}-${field.key}`} className={'w-full sm:w-36'}>
                  <SelectValue placeholder={`请选择${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{`全部${field.label.replace('所属', '')}`} </SelectItem>
                  {field.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
          ))}
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Label htmlFor={`${id}-created-from`} className="shrink-0">
              创建日期
            </Label>
            <div className="flex min-w-0 items-center gap-2">
              <Input
                id={`${id}-created-from`}
                type="date"
                aria-label="创建日期起始"
                value={draft.createdFrom || ''}
                onChange={event => update('createdFrom', event.target.value)}
                className="w-full min-w-0 sm:w-40"
                aria-invalid={!!filterError || undefined}
                aria-describedby={filterError ? `${id}-filter-error` : undefined}
              />
              <span className="text-sm text-muted-foreground">至</span>
              <Input
                type="date"
                aria-label="创建日期结束"
                value={draft.createdTo || ''}
                onChange={event => update('createdTo', event.target.value)}
                className="w-full min-w-0 sm:w-40"
                aria-invalid={!!filterError || undefined}
                aria-describedby={filterError ? `${id}-filter-error` : undefined}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`${id}-pending`} checked={draft.pendingOnly} onCheckedChange={value => update('pendingOnly', value === true)} />
            <Label htmlFor={`${id}-pending`}>仅显示待处理项目</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">
            <Search />
            搜索
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw />
            重置
          </Button>
          <Button type="button" variant="ghost" className={styles.mobileOnly} aria-expanded={filtersOpen} aria-controls={`${id}-advanced-filters`} onClick={() => setFiltersOpen(value => !value)}>
            {filtersOpen ? '收起筛选' : '展开筛选'}
            {advancedCount > 0 && `（${advancedCount}）`}
            <ChevronDown className={filtersOpen ? 'rotate-180' : undefined} />
          </Button>
        </div>
        {filterError && (
          <p id={`${id}-filter-error`} role="alert" className="w-full text-sm text-status-error">
            {filterError}
          </p>
        )}
      </form>
      <section className="ds-panel min-w-0 overflow-hidden" aria-label="项目列表">
        <div className="p-[var(--panel-space)]">
          <SectionHeader
            title="项目列表"
            actions={
              <Button
                onClick={() =>
                  setEditor({ id: null, name: '', type: projectTypes[0], team: teams[0], status: 'pending', owner: '', updated: '', priority: '普通', progress: 0, created: new Date().toLocaleDateString('sv-SE'), deadline: '', notes: '' })
                }
              >
                <Plus />
                新增项目
              </Button>
            }
          />
        </div>
        <DataTable
          className="min-w-[124rem] [&_thead]:bg-muted"
          columns={columns}
          rows={filtered.slice((current - 1) * perPage, current * perPage)}
          sort={sort}
          onSort={value => {
            setSort(value);
            setPage(1);
          }}
          caption="项目名称、编号、类型、团队、状态、负责人、优先级、进度、创建日期、截止日期、备注、更新日期与操作"
          emptyTitle="没有匹配的项目"
          emptyActions={
            <Button variant="outline" onClick={reset}>
              清除筛选
            </Button>
          }
        />
        <div className="border-t px-[var(--panel-space)]">
          <Pagination
            page={current}
            perPage={perPage}
            total={filtered.length}
            onChange={(next, size) => {
              setPage(size === perPage ? next : 1);
              setPerPage(size);
            }}
          />
        </div>
      </section>
      {editor && (
        <ProjectEditor
          key={editor.id || 'new'}
          project={editor}
          onClose={() => setEditor(null)}
          onSave={values => {
            if (values.id) setProjects(previous => previous.map(project => (project.id === values.id ? values : project)));
            else {
              const added = { ...values, id: `ITEM-${String(nextId.current++).padStart(3, '0')}` };
              setProjects(previous => [added, ...previous]);
            }
            setPage(1);
            setEditor(null);
            toast.success(values.id ? '项目已更新' : '项目已新增');
          }}
        />
      )}
      <Dialog
        open={!!detail}
        onOpenChange={open => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>项目详情</DialogTitle>
            <DialogDescription>查看项目的基本信息与处理状态。</DialogDescription>
          </DialogHeader>
          {detail && (
            <dl className="grid grid-cols-2 gap-5 text-sm">
              {[
                ['项目名称', detail.name],
                ['项目编号', detail.id],
                ['项目类型', detail.type],
                ['所属团队', detail.team],
                ['负责人', detail.owner],
                ['优先级', detail.priority || '普通'],
                ['完成进度', `${detail.progress ?? 0}%`],
                ['创建日期', detail.created || '—'],
                ['截止日期', detail.deadline || '—'],
                ['备注', detail.notes || '—'],
                ['更新日期', detail.updated || '—']
              ].map(([label, value]) => (
                <div key={label} className={label === '项目名称' ? 'col-span-2' : ''}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
              <div>
                <dt className="mb-1 text-muted-foreground">状态</dt>
                <dd>
                  <StatusIndicator {...projectStatuses[detail.status]} />
                </dd>
              </div>
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              关闭
            </Button>
            <Button
              onClick={() => {
                setEditor(detail);
                setDetail(null);
              }}
            >
              编辑项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={open => {
          if (!open) setDeleting(null);
        }}
        title="删除项目？"
        description={`将删除「${deleting?.name || ''}」。此操作仅影响当前预览数据。`}
        confirmLabel="确认删除"
        onConfirm={() => {
          setProjects(previous => previous.filter(project => project.id !== deleting.id));
          setDeleting(null);
          toast.success('项目已删除');
        }}
      />
    </div>
  );
}
