import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../ui/dropdown-menu';
import { cn } from '../../utils/cn';
import { isMenuActive } from './matching';

const itemClass = active =>
  cn('flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', active && 'bg-sidebar-accent font-semibold text-sidebar-primary');

function FlyoutItems({ items, location, onNavigate }) {
  return items.map(item => {
    const Icon = item.icon;
    if (item.children?.length)
      return (
        <DropdownMenuSub key={item.key}>
          <DropdownMenuSubTrigger className={isMenuActive(item, location) ? 'font-semibold text-primary' : undefined}>
            {Icon && <Icon aria-hidden="true" />}
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <FlyoutItems items={item.children} location={location} onNavigate={onNavigate} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    const active = isMenuActive(item, location);
    return (
      <DropdownMenuItem key={item.key || item.to} asChild>
        <Link to={item.to} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={active ? 'bg-accent font-semibold text-primary' : undefined}>
          {Icon && <Icon aria-hidden="true" />}
          {item.label}
        </Link>
      </DropdownMenuItem>
    );
  });
}

function MenuNode({ item, compact, location, onNavigate }) {
  const active = isMenuActive(item, location);
  const [open, setOpen] = useState(active);
  const id = useId();
  const Icon = item.icon;
  const group = !!item.children?.length;
  // 路由变化时展开当前叶节点的祖先；仍允许用户手动收起当前分组。
  useEffect(() => {
    if (active) setOpen(true);
  }, [active, location.pathname, location.search]);
  if (!group)
    return (
      <li>
        <Link to={item.to} title={compact ? item.label : undefined} aria-label={compact ? item.label : undefined} aria-current={active ? 'page' : undefined} onClick={onNavigate} className={itemClass(active)}>
          {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
          {!compact && <span className="min-w-0 truncate">{item.label}</span>}
        </Link>
      </li>
    );
  if (compact)
    return (
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={itemClass(active)} aria-label={item.label} title={item.label}>
              {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={12} className="min-w-48">
            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <FlyoutItems items={item.children} location={location} onNavigate={onNavigate} />
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    );
  return (
    <li>
      <button type="button" className={itemClass(active)} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
        {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronRight aria-hidden="true" className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-90')} />
      </button>
      <ul id={id} hidden={!open} className="ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-2">
        {item.children.map(child => (
          <MenuNode key={child.key || child.to} item={child} compact={false} location={location} onNavigate={onNavigate} />
        ))}
      </ul>
    </li>
  );
}

export default function Navigation({ items, compact, location, onNavigate }) {
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="主导航">
      <ul className="space-y-1">
        {items.map(item => (
          <MenuNode key={item.key || item.to} item={item} compact={compact} location={location} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  );
}
