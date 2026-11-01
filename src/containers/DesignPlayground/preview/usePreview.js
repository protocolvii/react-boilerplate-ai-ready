import { useLayoutEffect, useState } from 'react';
import { useAppearance } from '../../../design-system/appearance';
import { useLayout } from '../../../design-system/layouts';
import { FIELDS, PREVIEW_STORAGE_KEY, profileKey, readDraft, validValue } from './fields';

export default function usePreview() {
  const appearance = useAppearance();
  const layout = useLayout();
  const [original] = useState(() => ({ version: 1, appearance: { preset: appearance.preset, colorMode: appearance.colorMode, density: appearance.density }, layout: layout.layout, profiles: {} }));
  const [initial] = useState(() => {
    try {
      return readDraft(localStorage) || original;
    } catch {
      return original;
    }
  });
  const [profiles, setProfiles] = useState(initial.profiles);
  const [history, setHistory] = useState([]);
  const [baseline, setBaseline] = useState({});
  const key = profileKey(appearance);
  const values = profiles[key] || {};
  const invalid = Object.values(profiles).flatMap(tokens => FIELDS.filter(field => !validValue(field, tokens[field.token] || '')));
  const { beginPreview, endPreview } = appearance;
  const { beginPreview: beginLayout, endPreview: endLayout } = layout;
  useLayoutEffect(() => {
    beginPreview(initial.appearance);
    beginLayout(initial.layout);
    return () => {
      endPreview();
      endLayout();
    };
  }, [beginPreview, endPreview, beginLayout, endLayout, initial]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = FIELDS.map(({ token }) => [token, root.style.getPropertyValue(token), root.style.getPropertyPriority(token)]);
    const clear = () => previous.forEach(([token, value, priority]) => (value ? root.style.setProperty(token, value, priority) : root.style.removeProperty(token)));
    const refresh = () => {
      clear();
      const computed = getComputedStyle(root);
      setBaseline(Object.fromEntries(FIELDS.map(field => [field.token, computed.getPropertyValue(field.token).trim() || (field.fallback.startsWith('--') ? computed.getPropertyValue(field.fallback).trim() : field.fallback)])));
      FIELDS.forEach(field => {
        const value = profiles[key]?.[field.token];
        if (value?.trim() && validValue(field, value)) root.style.setProperty(field.token, value.trim());
      });
    };
    refresh();
    // CSS HMR 后重新读取源码基线；仅覆盖用户实际编辑的 Token。
    const onUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };
    let frame = requestAnimationFrame(refresh);
    if (import.meta.hot) import.meta.hot.on('vite:afterUpdate', onUpdate);
    return () => {
      cancelAnimationFrame(frame);
      if (import.meta.hot) import.meta.hot.off('vite:afterUpdate', onUpdate);
      clear();
    };
  }, [profiles, key, appearance.preset, appearance.resolvedMode, appearance.density]); // values 对应 profiles[key]，不依赖每次渲染生成的空对象。

  const snapshot = () => ({ version: 1, appearance: { preset: appearance.preset, colorMode: appearance.colorMode, density: appearance.density }, layout: layout.layout, profiles });
  const apply = next => {
    setProfiles(next.profiles);
    appearance.updateAppearance(next.appearance);
    layout.setLayout(next.layout);
  };
  const commit = next => {
    setHistory(current => [...current.slice(-49), snapshot()]);
    apply(next);
  };
  return {
    values,
    baseline,
    invalid,
    canUndo: history.length > 0,
    changeToken: (token, value) => commit({ ...snapshot(), profiles: { ...profiles, [key]: { ...values, [token]: value } } }),
    changeAppearance: patch => commit({ ...snapshot(), appearance: { ...snapshot().appearance, ...patch } }),
    changeLayout: value => commit({ ...snapshot(), layout: value }),
    undo: () => {
      if (history.length) {
        apply(history.at(-1));
        setHistory(current => current.slice(0, -1));
      }
    },
    restore: () => {
      commit(original);
      try {
        localStorage.removeItem(PREVIEW_STORAGE_KEY);
      } catch {
        /* 恢复无需依赖存储。 */
      }
    },
    stash: () => localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(snapshot())),
    exportConfig: () => ({ ...snapshot(), kind: 'design-playground-preview', scope: '仅为预览覆盖，未写入源码；profiles 的键为 preset:resolvedMode:density', source: 'src/design-system/tokens/', generatedAt: new Date().toISOString() })
  };
}
