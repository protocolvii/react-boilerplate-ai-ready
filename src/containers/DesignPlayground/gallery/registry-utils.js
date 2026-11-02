const required = ['id', 'name', 'category', 'description'];
const layouts = ['standard-admin', 'workspace', 'monitoring'];
const isComponent = value => typeof value === 'function' || (value && [Symbol.for('react.lazy'), Symbol.for('react.memo'), Symbol.for('react.forward_ref')].includes(value.$$typeof));

export function validateRegistries(components, pages) {
  const errors = [];
  const ids = new Set();
  for (const [kind, entries] of [
    ['component', components],
    ['page', pages]
  ]) {
    if (!Array.isArray(entries)) {
      errors.push(`${kind}: 注册表必须是数组`);
      continue;
    }
    entries.forEach((entry, index) => {
      const label = `${kind}[${index}]`;
      if (!entry || typeof entry !== 'object') {
        errors.push(`${label}: 条目必须是对象`);
        return;
      }
      required.forEach(key => {
        if (typeof entry[key] !== 'string' || !entry[key].trim()) errors.push(`${label}: 缺少 ${key}`);
      });
      if (typeof entry.id === 'string') {
        if (!/^[a-z][a-z0-9-]*$/.test(entry.id)) errors.push(`${label}: ID 仅使用小写字母、数字与连字符`);
        if (ids.has(entry.id)) errors.push(`${label}: 重复 ID ${entry.id}`);
        ids.add(entry.id);
        if (kind === 'page' && entry.id === 'components') errors.push(`${label}: components 是组件画廊保留入口`);
      }
      if (!isComponent(entry.preview)) errors.push(`${label}: 缺少有效的 preview 组件`);
      if (entry.tags !== undefined && (!Array.isArray(entry.tags) || entry.tags.some(tag => typeof tag !== 'string' || !tag.trim()))) errors.push(`${label}: tags 必须是非空字符串数组`);
      if (kind === 'page' && entry.layout !== undefined && !layouts.includes(entry.layout)) errors.push(`${label}: 未知布局 ${entry.layout}`);
    });
  }
  return errors;
}
export function filterRegistry(entries, query = '', category = 'all') {
  const search = query.trim().toLocaleLowerCase();
  return entries.filter(entry => (category === 'all' || entry.category === category) && (!search || [entry.name, entry.description, entry.category, ...(entry.tags || [])].join(' ').toLocaleLowerCase().includes(search)));
}
