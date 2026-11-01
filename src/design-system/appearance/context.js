import { createContext, useContext } from 'react';
export const AppearanceContext = createContext(null);
export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance 必须在 AppearanceProvider 中使用');
  return value;
}
