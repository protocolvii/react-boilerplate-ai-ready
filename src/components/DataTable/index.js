import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableCaption } from '../ui/table';
import { Button } from '../ui/button';
import EmptyState from '../EmptyState';
import { cn } from '../../utils/cn';
export default function DataTable({ columns, rows, rowKey = 'id', sort, onSort, loading = false, caption = '数据列表', emptyActions, emptyTitle = '暂无数据', className }) {
  if (loading)
    return (
      <div role="status" className="p-8 text-sm text-muted-foreground">
        加载中…
      </div>
    );
  if (!rows.length) return <EmptyState title={emptyTitle} actions={emptyActions} />;
  return (
    <Table className={cn('min-w-[42rem]', className)}>
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map(column => (
            <TableHead key={column.key} className={column.headerClassName || column.className} aria-sort={column.sortable ? (sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}>
              {column.sortable ? (
                <Button variant="ghost" size="sm" className="-ml-2" onClick={() => onSort?.({ key: column.key, direction: sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc' })}>
                  {column.header}
                  {sort?.key === column.key ? sort.direction === 'asc' ? <ArrowUp /> : <ArrowDown /> : <ChevronsUpDown />}
                </Button>
              ) : (
                column.header
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row[rowKey]}>
            {columns.map(column => (
              <TableCell key={column.key} className={column.className}>
                {column.render ? column.render(row) : row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
