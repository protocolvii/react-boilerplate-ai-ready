import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createMockMiddleware, mockApi } from '../vite/mock-api.mjs';
import configure from '../vite.config.mjs';

const hash = value => createHash('md5').update(value).digest('hex');

test('mock API supports login, refresh, password changes and logout through HTTP', async t => {
  const middleware = createMockMiddleware();
  const server = createServer((req, res) =>
    middleware(req, res, () => {
      res.writeHead(418);
      res.end('not a mock route');
    })
  );
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method = 'GET', body, token) => {
    const res = await fetch(`${origin}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: res.status, body: await res.json() };
  };
  const login = password => request('/api/authorizations', 'POST', { username: 'admin', password: hash(password) });

  assert.equal((await fetch(`${origin}/login`)).status, 418);
  assert.equal((await fetch(`${origin}/apiary`)).status, 418);
  assert.equal((await request('/api/unconfigured')).status, 404);
  assert.equal((await request('/api/user')).status, 401);
  assert.equal((await login('wrong-password')).status, 400);
  const malformed = await fetch(`${origin}/api/authorizations`, { method: 'POST', body: '{bad json' });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).errmsg, '请求体不是有效 JSON');

  const loggedIn = await login('admin123');
  assert.equal(loggedIn.status, 200);
  assert.equal(loggedIn.body.errcode, 0);
  assert.equal(loggedIn.body.expires_in, 7200);
  const auth = loggedIn.body;
  const user = await request('/api/user', 'GET', undefined, auth.access_token);
  assert.equal(user.body.username, 'admin');
  assert.equal((await request(`/api/authorizations/${auth.id}`, 'PUT', undefined, 'wrong-refresh')).status, 401);

  const refreshed = await request(`/api/authorizations/${auth.id}`, 'PUT', undefined, auth.refresh_token);
  assert.equal(refreshed.status, 200);
  const current = refreshed.body;
  assert.notEqual(current.access_token, auth.access_token);
  assert.equal((await request('/api/user', 'GET', undefined, auth.access_token)).status, 401);
  assert.equal((await request('/api/user', 'GET', undefined, current.access_token)).status, 200);

  const change = (old, password, confirm = password) =>
    request(
      '/api/user/password',
      'PUT',
      {
        old_password: hash(old),
        new_password: hash(password),
        confirm_password: hash(confirm)
      },
      current.access_token
    );
  assert.equal((await change('wrong-old', 'newpass123')).status, 400);
  assert.equal((await change('admin123', 'newpass123', 'different')).status, 400);
  assert.equal((await change('admin123', 'newpass123')).status, 200);
  assert.equal((await login('admin123')).status, 400);
  assert.equal((await login('newpass123')).status, 200);
  assert.equal((await request(`/api/authorizations/${current.id}`, 'DELETE')).status, 200);
  assert.equal((await request('/api/user', 'GET', undefined, current.access_token)).status, 401);
});

test('mock mode is opt-in, isolated from the normal proxy and forbidden in builds and preview', () => {
  const previousStage = process.env.STAGE;
  delete process.env.STAGE;
  try {
    const mock = configure({ command: 'serve', mode: 'mock' });
    const normal = configure({ command: 'serve', mode: 'development' });
    const build = configure({ command: 'build', mode: 'production' });
    assert(mock.plugins.some(plugin => plugin.name === 'app-mock-api'));
    assert(!normal.plugins.some(plugin => plugin.name === 'app-mock-api'));
    assert(!build.plugins.some(plugin => plugin.name === 'app-mock-api'));
    assert.equal(mock.server.proxy, undefined);
    assert(normal.server.proxy);
    assert.equal(mock.server.port, normal.server.port + 1);
    assert.equal(mock.define['process.env.STAGE'], '"dev"');
    assert.throws(() => configure({ command: 'build', mode: 'mock' }), /仅用于/);
    assert.throws(() => configure({ command: 'serve', mode: 'mock', isPreview: true }), /仅用于/);
  } finally {
    if (previousStage === undefined) delete process.env.STAGE;
    else process.env.STAGE = previousStage;
  }
});

test('mock plugin retains sessions and password across Vite reconfiguration, isolated by project', async t => {
  const root = `mock-reload-${Date.now()}`;
  let middleware;
  const configurePlugin = project =>
    mockApi().configureServer({
      config: { root: project, logger: { info() {} } },
      middlewares: {
        use(value) {
          middleware = value;
        }
      }
    });
  configurePlugin(root);
  const server = createServer((req, res) =>
    middleware(req, res, () => {
      res.writeHead(404);
      res.end();
    })
  );
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  t.after(() => {
    globalThis[Symbol.for('react-boilerplate:mock-api')].delete(root);
    globalThis[Symbol.for('react-boilerplate:mock-api')].delete(`${root}-other`);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const logged = await fetch(`${base}/api/authorizations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: hash('admin123') }) });
  const auth = await logged.json();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.access_token}` };
  const changed = await fetch(`${base}/api/user/password`, { method: 'PUT', headers, body: JSON.stringify({ old_password: hash('admin123'), new_password: hash('newpass123'), confirm_password: hash('newpass123') }) });
  assert.equal(changed.status, 200);
  configurePlugin(root);
  assert.equal((await fetch(`${base}/api/user`, { headers })).status, 200);
  const relogin = await fetch(`${base}/api/authorizations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: hash('newpass123') }) });
  assert.equal(relogin.status, 200);
  configurePlugin(`${root}-other`);
  assert.equal((await fetch(`${base}/api/user`, { headers })).status, 401);
});
