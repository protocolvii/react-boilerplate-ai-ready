import { createContext, useContext } from 'react';
export const LAYOUTS = [
  { id: 'standard-admin', name: 'Standard Admin' },
  { id: 'workspace', name: 'Workspace' },
  { id: 'monitoring', name: 'Monitoring' }
];
export const LayoutContext = createContext(null);
export function useLayout() {
  const value = useContext(LayoutContext);
  if (!value) throw new Error('useLayout 必须在 LayoutProvider 中使用');
  return value;
}
