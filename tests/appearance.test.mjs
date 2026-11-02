import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { DEFAULT_APPEARANCE, STORAGE_KEY, normalizeAppearance, readAppearance, getAppearanceBootstrapScript } from '../src/design-system/appearance/settings.js';

test('appearance validates each dimension independently and tolerates unavailable storage', () => {
  assert.deepEqual(normalizeAppearance({ preset: 'industrial-pro', colorMode: 'dark', density: 'compact' }), { preset: 'industrial-pro', colorMode: 'dark', density: 'compact' });
  assert.deepEqual(normalizeAppearance({ preset: 'unknown', colorMode: 'dark', density: 'huge' }), { ...DEFAULT_APPEARANCE, colorMode: 'dark' });
  assert.deepEqual(
    readAppearance({
      getItem() {
        throw new Error('blocked');
      }
    }),
    DEFAULT_APPEARANCE
  );
  assert.deepEqual(readAppearance({ getItem: () => '{bad' }), DEFAULT_APPEARANCE);
  assert.equal(DEFAULT_APPEARANCE.colorMode, 'light');
  assert.equal(normalizeAppearance({ colorMode: 'system' }).colorMode, 'light');
});

test('prepaint initialization migrates stored system mode to light before React', () => {
  const root = {
    dataset: {},
    style: {},
    classList: {
      toggle(name, value) {
        this[name] = value;
      }
    }
  };
  runInNewContext(getAppearanceBootstrapScript(), {
    document: { documentElement: root },
    localStorage: { getItem: key => (key === STORAGE_KEY ? JSON.stringify({ preset: 'creative-ai', colorMode: 'system', density: 'comfortable' }) : null) },
    matchMedia: () => ({ matches: true })
  });
  assert.equal(root.dataset.theme, 'creative-ai');
  assert.equal(root.dataset.density, 'comfortable');
  assert.equal(root.classList.dark, false);
  assert.equal(root.dataset.colorMode, 'light');
  assert.equal(root.style.colorScheme, 'light');
});
