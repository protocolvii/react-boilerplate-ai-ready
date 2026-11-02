import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { DEFAULT_APPEARANCE, normalizeAppearance, getAppearanceBootstrapScript } from '../src/design-system/appearance/settings.js';

test('appearance validates each dimension independently against project defaults', () => {
  assert.deepEqual(normalizeAppearance({ preset: 'industrial-pro', colorMode: 'dark', density: 'compact' }), { preset: 'industrial-pro', colorMode: 'dark', density: 'compact' });
  assert.deepEqual(normalizeAppearance({ preset: 'unknown', colorMode: 'dark', density: 'huge' }), { ...DEFAULT_APPEARANCE, colorMode: 'dark' });
  assert.deepEqual(normalizeAppearance(null), DEFAULT_APPEARANCE);
  assert.equal(normalizeAppearance({ colorMode: 'system' }).colorMode, DEFAULT_APPEARANCE.colorMode);
});

test('prepaint uses source defaults and never reads stale browser preferences', () => {
  for (const stored of [{ preset: 'creative-ai', colorMode: 'dark', density: 'compact' }, null]) {
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
      localStorage: {
        getItem() {
          assert.fail(`Must not read browser preference: ${JSON.stringify(stored)}`);
        }
      },
      matchMedia() {
        assert.fail('Must not read system preference');
      }
    });
    assert.equal(root.dataset.theme, DEFAULT_APPEARANCE.preset);
    assert.equal(root.dataset.density, DEFAULT_APPEARANCE.density);
    assert.equal(root.dataset.colorMode, DEFAULT_APPEARANCE.colorMode);
    assert.equal(root.classList.dark, DEFAULT_APPEARANCE.colorMode === 'dark');
    assert.equal(root.style.colorScheme, DEFAULT_APPEARANCE.colorMode);
  }
});
