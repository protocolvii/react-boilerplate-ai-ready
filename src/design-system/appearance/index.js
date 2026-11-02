import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { AppearanceContext } from './context';
import { DEFAULT_APPEARANCE, applyAppearance, normalizeAppearance } from './settings';

export function AppearanceProvider({ children }) {
  const sourceAppearance = DEFAULT_APPEARANCE;
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_APPEARANCE }));
  useLayoutEffect(() => {
    setSettings({ ...sourceAppearance });
  }, [sourceAppearance]);
  const [preview, setPreview] = useState(null);
  const activeSettings = preview ?? settings;
  const beginPreview = useCallback(value => setPreview(normalizeAppearance(value)), []);
  const endPreview = useCallback(() => setPreview(null), []);
  const commitPreview = useCallback(value => setSettings(normalizeAppearance(value)), []);
  const resolvedMode = activeSettings.colorMode;
  useLayoutEffect(() => {
    applyAppearance(document.documentElement, activeSettings);
  }, [activeSettings]);
  const updateAppearance = useCallback(
    patch => {
      const update = current => normalizeAppearance({ ...current, ...patch });
      if (preview !== null) setPreview(update);
      else setSettings(update);
    },
    [preview]
  );
  const value = useMemo(
    () => ({ ...activeSettings, resolvedMode, updateAppearance, beginPreview, endPreview, commitPreview, resetAppearance: () => (preview !== null ? setPreview({ ...DEFAULT_APPEARANCE }) : setSettings({ ...DEFAULT_APPEARANCE })) }),
    [activeSettings, resolvedMode, updateAppearance, beginPreview, endPreview, commitPreview, preview]
  );
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
export { useAppearance } from './context';
export { PRESETS, COLOR_MODES, DENSITIES } from './settings';
