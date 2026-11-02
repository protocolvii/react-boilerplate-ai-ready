import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AppearanceContext } from './context';
import { DEFAULT_APPEARANCE, STORAGE_KEY, applyAppearance, normalizeAppearance, readAppearance } from './settings';

export function AppearanceProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return readAppearance(window.localStorage);
    } catch {
      return { ...DEFAULT_APPEARANCE };
    }
  });
  const [preview, setPreview] = useState(null);
  const activeSettings = preview ?? settings;
  const beginPreview = useCallback(value => setPreview(normalizeAppearance(value)), []);
  const endPreview = useCallback(() => setPreview(null), []);
  const resolvedMode = activeSettings.colorMode;
  useLayoutEffect(() => {
    applyAppearance(document.documentElement, activeSettings);
  }, [activeSettings]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* 禁用存储时仍支持会话内切换。 */
    }
  }, [settings]);
  useEffect(() => {
    const handleStorage = event => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        setSettings(normalizeAppearance(JSON.parse(event.newValue)));
      } catch {
        setSettings({ ...DEFAULT_APPEARANCE });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  const updateAppearance = useCallback(
    patch => {
      const update = current => normalizeAppearance({ ...current, ...patch });
      if (preview !== null) setPreview(update);
      else setSettings(update);
    },
    [preview]
  );
  const value = useMemo(
    () => ({ ...activeSettings, resolvedMode, updateAppearance, beginPreview, endPreview, resetAppearance: () => (preview !== null ? setPreview({ ...DEFAULT_APPEARANCE }) : setSettings({ ...DEFAULT_APPEARANCE })) }),
    [activeSettings, resolvedMode, updateAppearance, beginPreview, endPreview, preview]
  );
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
export { useAppearance } from './context';
export { PRESETS, COLOR_MODES, DENSITIES } from './settings';
