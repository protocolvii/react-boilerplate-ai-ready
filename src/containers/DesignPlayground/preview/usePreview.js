import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppearance } from '../../../design-system/appearance';
import { useLayout } from '../../../design-system/layouts';
import projectDesign from '../../../design-system/project-design.json';
import { FIELDS, PREVIEW_STORAGE_KEY, profileKey, readDraft, validValue, validateProjectConfig } from './fields';

export default function usePreview() {
  const appearance = useAppearance();
  const layout = useLayout();
  const original = { ...projectDesign, profiles: {} };
  const [projectReady, setProjectReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState(() => {
    try {
      return sessionStorage.getItem('design-project-saved') || '';
    } catch {
      return '';
    }
  });
  const revision = useRef(null);
  const savingRef = useRef(false);
  useEffect(() => {
    try {
      sessionStorage.removeItem('design-project-saved');
    } catch {
      /* 不依赖浏览器存储。 */
    }
    fetch('/__design-project')
      .then(async response => {
        if (!response.ok) throw new Error('无法读取项目保存状态');
        revision.current = (await response.json()).revision;
        setProjectReady(true);
      })
      .catch(error => setSaveError(error.message));
  }, []);
  const [initial] = useState(() => {
    try {
      return readDraft(localStorage) || original;
    } catch {
      return original;
    }
  });
  const [profiles, setProfiles] = useState(initial.profiles);
  const [replaceProfiles, setReplaceProfiles] = useState(!!initial.replaceProfiles);
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
      // 完整导入时从基础主题取值，避免项目中已保存但备份未包含的覆盖泄漏到预览。
      const mode = root.dataset.colorMode;
      if (replaceProfiles) root.dataset.colorMode = 'import-base';
      const computed = getComputedStyle(root);
      const base = Object.fromEntries(FIELDS.map(field => [field.token, computed.getPropertyValue(field.token).trim() || (field.fallback.startsWith('--') ? computed.getPropertyValue(field.fallback).trim() : field.fallback)]));
      root.dataset.colorMode = mode;
      setBaseline(base);
      FIELDS.forEach(field => {
        const value = profiles[key]?.[field.token];
        if (value?.trim() && validValue(field, value)) root.style.setProperty(field.token, value.trim());
        else if (replaceProfiles && base[field.token]) root.style.setProperty(field.token, base[field.token]);
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
  }, [profiles, replaceProfiles, key, appearance.preset, appearance.resolvedMode, appearance.density]); // values 对应 profiles[key]，不依赖每次渲染生成的空对象。

  const snapshot = () => ({ version: 1, appearance: { preset: appearance.preset, colorMode: appearance.colorMode, density: appearance.density }, layout: layout.layout, profiles, replaceProfiles });
  const apply = next => {
    setProfiles(next.profiles);
    setReplaceProfiles(!!next.replaceProfiles);
    appearance.updateAppearance(next.appearance);
    layout.setLayout(next.layout);
  };
  const commit = next => {
    setHistory(current => [...current.slice(-49), snapshot()]);
    apply(next);
  };
  const saveProject = async () => {
    if (savingRef.current || invalid.length) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    setSaveMessage('');
    try {
      if (!revision.current) throw new Error('尚未读取到项目状态，请刷新页面后重试');
      const response = await fetch('/__design-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision: revision.current, config: snapshot(), replaceProfiles })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '保存失败');
      revision.current = result.revision;
      appearance.commitPreview(snapshot().appearance);
      layout.commitPreview(snapshot().layout);
      setHistory([]);
      try {
        localStorage.removeItem(PREVIEW_STORAGE_KEY);
        sessionStorage.setItem('design-project-saved', '已写入项目文件，尚未 Git 提交。');
      } catch {
        /* 不影响源码保存。 */
      }
      setSaveMessage('已写入项目文件，尚未 Git 提交。');
    } catch (error) {
      setSaveError(error.message || '保存失败，调整仍保留');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return {
    projectReady,
    saving,
    saveError,
    saveMessage,
    saveProject,
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
    importConfig: input => commit({ ...validateProjectConfig(input, CSS.supports), replaceProfiles: true }),
    exportConfig: async () => {
      const response = await fetch('/__design-project');
      if (!response.ok) throw new Error('无法读取项目已保存配置');
      return (await response.json()).config;
    },
    copyConfig: () => ({ ...snapshot(), kind: 'design-playground-preview', scope: '仅为预览覆盖，未写入源码；profiles 的键为 preset:resolvedMode:density', source: 'src/design-system/tokens/', generatedAt: new Date().toISOString() })
  };
}
