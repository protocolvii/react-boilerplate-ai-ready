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
  const [mobileOpen, setMobileOpen] = useState(false);
  const setLayout = useCallback(value => setLayoutValue(normalize(value)), []);
  useEffect(() => {
    try {
      localStorage.setItem(key, layout);
    } catch {
      /* 会话内仍可切换。 */
    }
  }, [layout]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const close = () => {
      if (media.matches) setMobileOpen(false);
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
  const value = useMemo(() => ({ layout, setLayout, mobileOpen, setMobileOpen }), [layout, setLayout, mobileOpen]);
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
