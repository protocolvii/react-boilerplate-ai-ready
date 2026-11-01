import React, { useMemo, useState } from 'react';
import { FolderKanban, CircleCheck, Clock3, Users, Plus, MoreHorizontal, FileText, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { MetricCard, SectionHeader, SearchToolbar, FilterBar, DataTable, Pagination, StatusIndicator, ConfirmDialog } from '../../components';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { initialProjects, projectStatuses } from './data';

export default function DataManagement() {
  const [rows, setRows] = useState(initialProjects);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'updated', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [archiving, setArchiving] = useState(null);
  const filtered = useMemo(
    () => rows.filter(row => row.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || row.status === filter)).sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key]), 'zh-CN') * (sort.direction === 'asc' ? 1 : -1)),
    [rows, query, filter, sort]
  );
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)));
  const openEditor = row => {
    setEditing(row);
    setName(row?.name || '');
  };
  const clear = () => {
    setDraft('');
    setQuery('');
    setFilter('all');
    setPage(1);
  };
  const columns = [
    {
      key: 'name',
      header: '项目名称',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <span className="rounded-lg border bg-muted p-2 text-muted-foreground">
            <FileText aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {row.id} · {row.kind}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'owner',
      header: '负责人',
      render: row => (
        <span className="inline-flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground">{row.initials}</span>
          {row.owner}
        </span>
      )
    },
    { key: 'status', header: '状态', render: row => <StatusIndicator {...projectStatuses[row.status]} /> },
    { key: 'updated', header: '更新时间', sortable: true, render: row => <span className="tabular-nums text-muted-foreground">{row.updated}</span> },
    {
      key: 'actions',
      header: '操作',
      render: row => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`项目操作 ${row.name}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openEditor(row)}>查看与编辑</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setArchiving(row)}>
              <Archive />
              归档项目
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];
  return (
    <div className="space-y-[var(--layout-gap)]">
      <SectionHeader
        title="项目概览"
        description="将任务、知识与数据组织为持续运行的工作项目。"
        actions={
          <Button onClick={() => openEditor({ id: null })}>
            <Plus />
            新建项目
          </Button>
        }
      />
      <div className="grid gap-[var(--layout-gap)] sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="全部项目" value={rows.length} detail="当前工作空间" icon={FolderKanban} />
        <MetricCard label="运行中" value={rows.filter(row => row.status === 'active').length} detail="服务正常运行" icon={CircleCheck} />
        <MetricCard label="待审核" value={rows.filter(row => row.status === 'review').length} detail="需要负责人确认" icon={Clock3} />
        <MetricCard label="协作成员" value={new Set(rows.map(row => row.owner)).size} detail="共享一个工作空间" icon={Users} />
      </div>
      <section className="ds-panel overflow-hidden" aria-label="项目列表">
        <div className="space-y-4 p-[var(--panel-space)]">
          <SearchToolbar
            value={draft}
            onChange={setDraft}
            onSubmit={() => {
              setQuery(draft.trim());
              setPage(1);
            }}
            actions={
              <Button variant="ghost" onClick={clear}>
                清除筛选
              </Button>
            }
          />
          <FilterBar summary={`找到 ${filtered.length} 个项目 · 静态演示数据`}>
            <Label htmlFor="project-status" className="text-xs text-muted-foreground">
              状态
            </Label>
            <Select
              value={filter}
              onValueChange={value => {
                setFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger id="project-status" aria-label="项目状态" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(projectStatuses).map(([value, item]) => (
                  <SelectItem key={value} value={value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterBar>
        </div>
        <DataTable
          columns={columns}
          rows={filtered.slice((current - 1) * perPage, current * perPage)}
          sort={sort}
          onSort={value => {
            setSort(value);
            setPage(1);
          }}
          caption="项目名称、负责人、状态与更新时间"
          emptyTitle="没有匹配的项目"
          emptyActions={
            <Button variant="outline" onClick={clear}>
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
      <Dialog
        open={!!editing}
        onOpenChange={open => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? '编辑项目' : '新建项目'}</DialogTitle>
            <DialogDescription>仅修改本页演示数据，刷新页面后恢复。</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={event => {
              event.preventDefault();
              if (!name.trim()) {
                toast.error('请输入项目名称');
                return;
              }
              if (editing.id) setRows(currentRows => currentRows.map(row => (row.id === editing.id ? { ...row, name: name.trim() } : row)));
              else setRows(currentRows => [{ id: `PRJ-DEMO-${Date.now()}`, name: name.trim(), owner: '当前用户', initials: '我', status: 'draft', updated: '2026-11-02', kind: '演示项目' }, ...currentRows]);
              setEditing(null);
              toast.success('项目已保存');
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="project-name">项目名称</Label>
              <Input id="project-name" value={name} onChange={event => setName(event.target.value)} required maxLength={100} />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditing(null)}>
                取消
              </Button>
              <Button type="submit">保存更改</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!archiving}
        onOpenChange={open => {
          if (!open) setArchiving(null);
        }}
        title="归档项目？"
        description={`将从当前演示列表移除「${archiving?.name || ''}」。刷新页面可恢复。`}
        confirmLabel="确认归档"
        onConfirm={() => {
          setRows(currentRows => currentRows.filter(row => row.id !== archiving.id));
          setArchiving(null);
          toast.success('项目已归档');
        }}
      />
    </div>
  );
}
