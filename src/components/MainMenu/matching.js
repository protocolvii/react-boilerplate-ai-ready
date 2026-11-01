import { matchPath } from 'react-router-dom';

export function isMenuActive(item, location) {
  if (item.children?.length) return item.children.some(child => isMenuActive(child, location));
  if (!item.to) return false;
  const target = new URL(item.to, 'http://menu.local');
  if (!matchPath({ path: target.pathname, end: item.end !== false }, location.pathname)) return false;
  const search = new URLSearchParams(location.search);
  return [...target.searchParams].every(([key, value]) => (search.get(key) ?? item.defaultSearch?.[key]) === value);
}
