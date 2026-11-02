import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import projectDesign from '../project-design.json';
import { LAYOUTS, LayoutContext } from './context';
const normalize = value => (LAYOUTS.some(layout => layout.id === value) ? value : projectDesign.layout);
export function LayoutProvider({ children }) {
  const sourceLayout = projectDesign.layout;
  const [layout, setLayoutValue] = useState(projectDesign.layout);
  useLayoutEffect(() => {
    setLayoutValue(sourceLayout);
  }, [sourceLayout]);
  const [preview, setPreview] = useState(null);
  const beginPreview = useCallback(value => setPreview(normalize(value)), []);
  const endPreview = useCallback(() => setPreview(null), []);
  const commitPreview = useCallback(value => setLayoutValue(normalize(value)), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const setLayout = useCallback(
    value => {
      if (preview !== null) setPreview(normalize(value));
      else setLayoutValue(normalize(value));
    },
    [preview]
  );
  useEffect(() => {
    const media = window.matchMedia('(width < 768px), (hover: none) and (pointer: coarse)');
    const close = () => {
      if (!media.matches) setMobileOpen(false);
    };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  const value = useMemo(() => ({ layout: preview ?? layout, setLayout, mobileOpen, setMobileOpen, beginPreview, endPreview, commitPreview }), [layout, preview, setLayout, mobileOpen, beginPreview, endPreview, commitPreview]);
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
