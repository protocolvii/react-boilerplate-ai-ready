import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AppearanceContext } from './context';
import { DEFAULT_APPEARANCE, STORAGE_KEY, applyAppearance, normalizeAppearance, readAppearance } from './settings';

const subscribeSystem = callback => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const getSystemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const getServerDark = () => false;

export function AppearanceProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return readAppearance(window.localStorage);
    } catch {
      return { ...DEFAULT_APPEARANCE };
    }
  });
  const systemDark = useSyncExternalStore(subscribeSystem, getSystemDark, getServerDark);
  const resolvedMode = settings.colorMode === 'system' ? (systemDark ? 'dark' : 'light') : settings.colorMode;
  useLayoutEffect(() => {
    applyAppearance(document.documentElement, settings, systemDark);
  }, [settings, systemDark]);
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
  const updateAppearance = useCallback(patch => setSettings(current => normalizeAppearance({ ...current, ...patch })), []);
  const value = useMemo(() => ({ ...settings, resolvedMode, updateAppearance, resetAppearance: () => setSettings({ ...DEFAULT_APPEARANCE }) }), [settings, resolvedMode, updateAppearance]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
export { useAppearance } from './context';
export { PRESETS, COLOR_MODES, DENSITIES } from './settings';
