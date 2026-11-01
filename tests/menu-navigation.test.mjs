import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isMenuActive } from '../src/components/MainMenu/matching.js';

test('menu matching distinguishes sibling views and respects default query values', () => {
  const data = { to: '/design-playground?view=data', defaultSearch: { view: 'data' } };
  const components = { to: '/design-playground?view=components' };
  assert.equal(isMenuActive(data, { pathname: '/design-playground', search: '' }), true);
  assert.equal(isMenuActive(components, { pathname: '/design-playground', search: '' }), false);
  assert.equal(isMenuActive(data, { pathname: '/design-playground', search: '?view=components' }), false);
  assert.equal(isMenuActive(components, { pathname: '/design-playground', search: '?view=components&other=1' }), true);
});

test('nested menu groups inherit the active leaf and routes match exact paths by default', () => {
  const group = { children: [{ children: [{ to: '/devices' }] }] };
  assert.equal(isMenuActive(group, { pathname: '/devices', search: '' }), true);
  assert.equal(isMenuActive(group, { pathname: '/devices/123', search: '' }), false);
  assert.equal(isMenuActive({ to: '/devices', end: false }, { pathname: '/devices/123', search: '' }), true);
  assert.equal(isMenuActive({ to: '/devices', end: false }, { pathname: '/devices-extra', search: '' }), false);
  assert.equal(isMenuActive({ to: '/' }, { pathname: '/devices', search: '' }), false);
});
