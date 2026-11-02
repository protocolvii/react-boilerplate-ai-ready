import projectDesign from '../project-design.json' with { type: 'json' };
export const PRESETS = [
  { id: 'modern-saas', name: 'Modern SaaS', description: '清晰、克制的日常工作空间' },
  { id: 'industrial-pro', name: 'Industrial Pro', description: '精密、可靠的数据与运维界面' },
  { id: 'creative-ai', name: 'Creative AI', description: '柔和、有辨识度的智能工作台' }
];
export const COLOR_MODES = ['light', 'dark'];
export const DENSITIES = ['default', 'comfortable', 'compact'];
export const DEFAULT_APPEARANCE = projectDesign.appearance;

export function normalizeAppearance(value) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    preset: PRESETS.some(preset => preset.id === input.preset) ? input.preset : DEFAULT_APPEARANCE.preset,
    colorMode: COLOR_MODES.includes(input.colorMode) ? input.colorMode : DEFAULT_APPEARANCE.colorMode,
    density: DENSITIES.includes(input.density) ? input.density : DEFAULT_APPEARANCE.density
  };
}
export function applyAppearance(root, settings) {
  const mode = settings.colorMode;
  root.dataset.theme = settings.preset;
  root.dataset.density = settings.density;
  root.dataset.colorMode = settings.colorMode;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
  return mode;
}
export function getAppearanceBootstrapScript() {
  // 与 Provider 共用归一化逻辑，在 CSS 和 React 加载前设置根属性。
  return `(()=>{const settings=${JSON.stringify(DEFAULT_APPEARANCE)};${applyAppearance.toString()};applyAppearance(document.documentElement,settings)})();`;
}
