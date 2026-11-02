import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FIELDS, normalizeDraft, readDraft, validValue, profileKey, validateProjectConfig } from '../src/containers/DesignPlayground/preview/fields.js';

test('drafts only restore known tokens, profiles and normalized appearance settings', () => {
  const result = normalizeDraft({
    version: 1,
    appearance: { preset: 'creative-ai', density: 'invalid' },
    layout: 'invalid',
    profiles: {
      'creative-ai:dark:compact': { '--primary': '#123456', '--unknown': 'bad', '--radius': 10 },
      'unknown:dark:compact': { '--primary': 'red' },
      'creative-ai:system:compact': { '--primary': 'red' }
    }
  });
  assert.deepEqual(result.profiles, { 'creative-ai:dark:compact': { '--primary': '#123456' } });
  assert.equal(result.appearance.preset, 'creative-ai');
  assert.equal(result.appearance.density, 'default');
  assert.equal(result.layout, 'standard-admin');
  assert.equal(normalizeDraft({ version: 2, profiles: {} }), null);
  assert.equal(
    readDraft({
      getItem() {
        throw new Error('blocked');
      }
    }),
    null
  );
  assert.equal(readDraft({ getItem: () => 'invalid json' }), null);
});

test('validation uses the actual CSS property and empty values follow source tokens', () => {
  const field = FIELDS.find(item => item.token === '--radius');
  let property;
  assert.equal(
    validValue(field, '12px', name => {
      property = name;
      return true;
    }),
    true
  );
  assert.equal(property, 'border-radius');
  assert.equal(
    validValue(field, '', () => false),
    true
  );
  assert.equal(
    validValue(field, 'not a length', () => false),
    false
  );
  assert.equal(
    validValue(field, '12px; color: red', () => true),
    false
  );
  assert.equal(profileKey({ preset: 'modern-saas', resolvedMode: 'dark', density: 'compact' }), 'modern-saas:dark:compact');
});

test('import validates complete snapshots without silently dropping invalid data', () => {
  const input = { version: 1, appearance: { preset: 'modern-saas', colorMode: 'light', density: 'default' }, layout: 'standard-admin', profiles: { 'modern-saas:light:default': { '--primary': '#123456' } } };
  assert.deepEqual(
    validateProjectConfig(input, () => true),
    input
  );
  for (const patch of [
    { version: 2 },
    { profiles: [] },
    { layout: 'unknown' },
    { appearance: { ...input.appearance, colorMode: 'system' } },
    { profiles: { 'bad:light:default': {} } },
    { profiles: { 'modern-saas:light:default': { '--unknown': 'red' } } },
    { profiles: { 'modern-saas:light:default': { '--primary': 'url(https://example.com)' } } }
  ])
    assert.throws(() => validateProjectConfig({ ...input, ...patch }, () => true));
  assert.throws(() => validateProjectConfig(input, () => false));
  assert.equal(normalizeDraft({ ...input, replaceProfiles: true }).replaceProfiles, true);
});
