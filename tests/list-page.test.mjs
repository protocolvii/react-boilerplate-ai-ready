import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialProjects, emptyFilters, teams, projectTypes, projectStatuses, filterProjects } from '../src/containers/DesignPlayground/ListPage/data.js';

test('list template combines project name, type, team and status filters', () => {
  const criteria = { ...emptyFilters, name: ' 网站 ', type: '资料', team: '客户支持', status: 'pending', pendingOnly: true };
  const found = filterProjects(initialProjects, criteria);
  assert(found.length > 0);
  assert(found.every(row => row.name.includes('网站') && row.type === '资料' && row.team === '客户支持' && row.status === 'pending'));
  assert.equal(filterProjects(initialProjects, { ...emptyFilters, name: 'not-a-project' }).length, 0);
  const fixture = [{ ...initialProjects[0], name: 'Web 界面升级' }];
  assert.equal(filterProjects(fixture, { ...emptyFilters, name: ' web ' }).length, 1);
});

test('generic project data has unique IDs, valid choices and resettable filtering', () => {
  assert.equal(new Set(initialProjects.map(row => row.id)).size, initialProjects.length);
  assert(initialProjects.every(row => teams.includes(row.team) && projectTypes.includes(row.type) && projectStatuses[row.status]));
  const before = JSON.stringify(initialProjects);
  filterProjects(initialProjects, emptyFilters).reverse();
  assert.equal(JSON.stringify(initialProjects), before);
  assert.equal(filterProjects(initialProjects, emptyFilters).length, 32);
  assert(filterProjects(initialProjects, { ...emptyFilters, pendingOnly: true }).every(row => row.status === 'pending'));
});

test('advanced filters combine partial identifiers, owners and inclusive dates', () => {
  const rows = filterProjects(initialProjects, { ...emptyFilters, id: ' item-001 ', owner: '陈', createdFrom: '2026-09-01', createdTo: '2026-09-01' });
  assert.deepEqual(
    rows.map(row => row.id),
    ['ITEM-001']
  );
  assert.equal(filterProjects(initialProjects, { ...emptyFilters, createdFrom: '2026-10-01' }).length, 0);
  assert.equal(filterProjects(initialProjects, { ...emptyFilters, createdFrom: '2026-09-20', createdTo: '2026-09-01' }).length, 0);
});
