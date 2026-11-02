import assert from 'node:assert/strict';
import { test } from 'node:test';
import { componentRegistry } from '../src/containers/DesignPlayground/gallery/component-registry.js';
import { pageRegistry } from '../src/containers/DesignPlayground/gallery/page-registry.js';
import { validateRegistries, filterRegistry } from '../src/containers/DesignPlayground/gallery/registry-utils.js';

test('actual registries contain valid previews, metadata and globally unique IDs', () => {
  assert.deepEqual(validateRegistries(componentRegistry, pageRegistry), []);
  assert(componentRegistry.length > 0 && pageRegistry.length > 0);
  assert.equal(pageRegistry[0].id, 'list');
  assert.equal(pageRegistry.find(entry => entry.id === 'data').name, 'Dashboard');
  const documentedComponents = ['PageHeader', 'SectionHeader', 'MetricCard', 'StatusIndicator', 'EmptyState', 'SearchToolbar', 'FilterBar', 'DataTable', 'ConfirmDialog'];
  const tags = new Set(componentRegistry.flatMap(entry => entry.tags || []));
  documentedComponents.forEach(name => assert(tags.has(name), `Missing public component preview: ${name}`));
  for (const id of ['data', 'list', 'monitoring', 'workspace'])
    assert(
      pageRegistry.some(entry => entry.id === id),
      `Missing page template: ${id}`
    );
});

test('registry validation rejects collisions, missing previews and invalid page layouts', () => {
  const entry = { id: 'valid', name: '示例', category: 'Basic', description: '测试', preview: () => null };
  const errors = validateRegistries([entry, { ...entry, preview: null }], [{ ...entry, id: 'components', layout: 'unknown', tags: [1] }]);
  for (const fragment of ['重复 ID', 'preview', '保留入口', '未知布局', 'tags'])
    assert(
      errors.some(message => message.includes(fragment)),
      fragment
    );
  assert(validateRegistries([null, { id: 'Bad ID' }], []).length > 0);
});

test('gallery search combines category and component-name tags without changing registry order', () => {
  const result = filterRegistry(componentRegistry, 'DATATABLE', 'Business');
  assert.deepEqual(
    result.map(entry => entry.id),
    ['data-table']
  );
  assert.equal(filterRegistry(componentRegistry, 'not-present').length, 0);
  assert.equal(filterRegistry(componentRegistry).length, componentRegistry.length);
});
