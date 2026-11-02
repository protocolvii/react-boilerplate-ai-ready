import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LAYOUTS, LayoutContext } from './context';
const key = 'react-boilerplate:layout:v1';
const normalize = value => (LAYOUTS.some(layout => layout.id === value) ? value : 'standard-admin');
export function LayoutProvider({ children }) {
  const [layout, setLayoutValue] = useState(() => {
    try {
      return normalize(localStorage.getItem(key));
    } catch {
      return 'standard-admin';
    }
  });
  const [preview, setPreview] = useState(null);
  const beginPreview = useCallback(value => setPreview(normalize(value)), []);
  const endPreview = useCallback(() => setPreview(null), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const setLayout = useCallback(
    value => {
      if (preview !== null) setPreview(normalize(value));
      else setLayoutValue(normalize(value));
    },
    [preview]
  );
  useEffect(() => {
    try {
      localStorage.setItem(key, layout);
    } catch {
      /* 会话内仍可切换。 */
    }
  }, [layout]);
  useEffect(() => {
    const media = window.matchMedia('(width < 768px), (hover: none) and (pointer: coarse)');
    const close = () => {
      if (!media.matches) setMobileOpen(false);
    };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  useEffect(() => {
    const sync = event => {
      if (event.key === key || event.key === null) setLayoutValue(normalize(event.newValue));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const value = useMemo(() => ({ layout: preview ?? layout, setLayout, mobileOpen, setMobileOpen, beginPreview, endPreview }), [layout, preview, setLayout, mobileOpen, beginPreview, endPreview]);
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
