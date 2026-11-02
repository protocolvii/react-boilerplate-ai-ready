import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { designSave, prepareDesign } from '../vite/design-save.mjs';

const config = () => ({ version: 1, appearance: { preset: 'modern-saas', colorMode: 'light', density: 'default' }, layout: 'standard-admin', profiles: { 'modern-saas:light:default': { '--primary': '#123456' } } });
test('save preserves unrelated profiles and removes cleared overrides with scoped CSS', () => {
  const input = config();
  input.profiles['modern-saas:light:default']['--radius'] = '';
  const current = { profiles: { 'modern-saas:light:default': { '--radius': '8px' }, 'creative-ai:dark:compact': { '--primary': 'red' } } };
  const [json, css] = prepareDesign(input, current);
  assert.equal(JSON.parse(json).profiles['creative-ai:dark:compact']['--primary'], 'red');
  assert(!css.includes('--radius'));
  assert(css.includes('[data-color-mode="light"][data-density="default"]'));
  for (const value of ['red; } body { display: none', 'url(https://example.com)', 'r\\65 d', 'red/*x*/']) {
    input.profiles['modern-saas:light:default']['--primary'] = value;
    assert.throws(() => prepareDesign(input, current));
  }
  assert.throws(() => prepareDesign({ ...config(), profiles: { '../../x': {} } }, current));
  assert.throws(() => prepareDesign({ ...config(), layout: 'invalid' }, current));
});
test('development save validates requests, rejects stale writes and only writes designated files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'design-save-'));
  try {
    await mkdir(join(root, 'src/design-system/tokens'), { recursive: true });
    const json = join(root, 'src/design-system/project-design.json');
    const css = join(root, 'src/design-system/tokens/project.css');
    await writeFile(json, JSON.stringify({ ...config(), profiles: {} }));
    await writeFile(css, '/* initial */');
    let handler;
    designSave().configureServer({
      config: { root },
      middlewares: {
        use(fn) {
          handler = fn;
        }
      }
    });
    const call = async (method, data, extra = {}) => {
      const req = Readable.from(data === undefined ? [] : [JSON.stringify(data)]);
      Object.assign(req, { method, url: '/__design-project', headers: { host: 'localhost:3000', 'content-type': 'application/json', ...extra } });
      let result;
      const res = {
        setHeader() {},
        end(body) {
          result = { status: this.statusCode, body: JSON.parse(body) };
        }
      };
      await handler(req, res, () => assert.fail('unexpected next'));
      return result;
    };
    const first = await call('GET');
    assert.deepEqual(first.body.config.profiles, {});
    assert.equal((await call('POST', { revision: first.body.revision, config: config() }, { origin: 'https://evil.example' })).status, 403);
    assert.equal((await call('POST', { revision: 'stale', config: config() })).status, 409);
    assert.equal((await call('POST', { revision: first.body.revision, config: { ...config(), layout: 'bad' } })).status, 400);
    const saved = await call('POST', { revision: first.body.revision, config: config() });
    assert.equal(saved.status, 200);
    assert((await readFile(css, 'utf8')).includes('--primary: #123456'));
    assert.equal(JSON.parse(await readFile(json, 'utf8')).appearance.colorMode, 'light');
    assert.equal((await call('POST', { revision: first.body.revision, config: config() })).status, 409);
    assert.equal((await call('DELETE')).status, 405);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('saving imported snapshot replaces all old profiles and generated CSS', () => {
  const current = { profiles: { 'modern-saas:light:default': { '--radius': '20px' }, 'creative-ai:dark:compact': { '--primary': 'red' } } };
  const [json, css] = prepareDesign(config(), current, true);
  assert.deepEqual(JSON.parse(json).profiles, config().profiles);
  assert(!css.includes('--radius'));
  assert(!css.includes('creative-ai'));
  const [empty, emptyCss] = prepareDesign({ ...config(), profiles: {} }, current, true);
  assert.deepEqual(JSON.parse(empty).profiles, {});
  assert(!emptyCss.includes(':root'));
});
