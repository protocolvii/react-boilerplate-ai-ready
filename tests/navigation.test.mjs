import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLoginDestination, navigateReplace, setNavigate } from '../src/utils/navigation/index.js';

test('login redirects preserve requested deep paths, query strings and fragments', () => {
  const from = { pathname: '/design-playground', search: '?view=components', hash: '#inputs' };
  assert.deepEqual(getLoginDestination(from), from);
  assert.deepEqual(getLoginDestination({ pathname: '/change-password' }), { pathname: '/change-password', search: '', hash: '' });
  for (const value of [null, { pathname: '/login' }, { pathname: '//example.com' }, { pathname: '/\\example.com' }, { pathname: 'https://example.com' }]) assert.equal(getLoginDestination(value), '/');
  const previous = globalThis.window;
  globalThis.window = { location: from };
  let result;
  setNavigate((to, options) => {
    result = { to, options };
  });
  try {
    navigateReplace('/login');
    assert.deepEqual(result, { to: '/login', options: { replace: true, state: { from } } });
    globalThis.window.location = { pathname: '/login' };
    navigateReplace('/login');
    assert.deepEqual(result.options.state.from, from);
    navigateReplace('/');
    assert.deepEqual(result, { to: '/', options: { replace: true } });
  } finally {
    setNavigate(null);
    globalThis.window = previous;
  }
});
