import { normalizeAppearance, PRESETS, DENSITIES } from '../../../design-system/appearance/settings.js';

const field = (token, label, property, fallback = '') => ({ token: `--${token}`, label, property, fallback });
const color = (token, label) => field(token, label, 'color');
export const FIELD_GROUPS = [
  {
    title: '主色与界面语义颜色',
    fields: [
      color('primary', '主色'),
      color('primary-foreground', '主色文字'),
      color('background', '页面背景'),
      color('foreground', '主要文字'),
      color('card', '卡片背景'),
      color('card-foreground', '卡片文字'),
      color('popover', '浮层背景'),
      color('popover-foreground', '浮层文字'),
      color('secondary', '次要背景'),
      color('secondary-foreground', '次要文字'),
      color('muted', '弱化背景'),
      color('muted-foreground', '弱化文字'),
      color('accent', '交互背景'),
      color('accent-foreground', '交互文字'),
      color('destructive', '危险操作'),
      color('border', '边框颜色'),
      color('input', '输入边框'),
      color('ring', '焦点颜色')
    ]
  },
  {
    title: '状态、导航与图表颜色',
    fields: [
      ...[
        ['success', '成功'],
        ['warning', '警告'],
        ['error', '错误'],
        ['info', '信息'],
        ['neutral', '中性']
      ].flatMap(([tone, label]) => [color(`status-${tone}`, `${label}强调色`), color(`status-${tone}-foreground`, `${label}文字`), color(`status-${tone}-background`, `${label}背景`)]),
      color('sidebar', '导航背景'),
      color('sidebar-foreground', '导航文字'),
      color('sidebar-primary', '导航选中色'),
      color('sidebar-primary-foreground', '导航主色文字'),
      color('sidebar-accent', '导航选中背景'),
      color('sidebar-accent-foreground', '导航交互文字'),
      color('sidebar-border', '导航边框'),
      color('sidebar-ring', '导航焦点'),
      ...[1, 2, 3, 4, 5].map(index => color(`chart-${index}`, `图表序列 ${index}`))
    ]
  },
  {
    title: '字体与排版',
    fields: [
      field('font-body', '基础字体', 'font-family'),
      field('text-body', '基础字号', 'font-size'),
      field('font-weight-body', '正文字重', 'font-weight'),
      field('line-height-body', '正文行高', 'line-height'),
      field('text-title', '页面标题字号', 'font-size'),
      field('heading-weight', '标题字重', 'font-weight')
    ]
  },
  { title: '圆角、阴影与边框', fields: [field('radius', '基础圆角', 'border-radius'), field('panel-shadow', '卡片阴影', 'box-shadow'), field('shadow-overlay', '浮层阴影', 'box-shadow'), field('border-width', '面板边框宽度', 'border-width')] },
  {
    title: '页面、卡片与表格间距',
    fields: [
      field('page-space', '页面内边距', 'padding', '--panel-space'),
      field('panel-space', '卡片内边距', 'padding'),
      field('layout-gap', '区块间距', 'gap'),
      field('card-gap', '卡片内部间距', 'gap', '--layout-gap'),
      field('table-row-height', '表格最小行高', 'height', 'auto'),
      field('table-cell-space', '表格单元格上下间距', 'padding'),
      field('control-height', '默认控件高度', 'height')
    ]
  }
];
export const FIELDS = FIELD_GROUPS.flatMap(group => group.fields);
export const PREVIEW_STORAGE_KEY = 'react-boilerplate:playground-draft:v1';
export const profileKey = appearance => `${appearance.preset}:${appearance.resolvedMode}:${appearance.density}`;
export function normalizeDraft(input) {
  if (!input || input.version !== 1 || typeof input.profiles !== 'object' || !input.profiles) return null;
  const allowed = new Set(FIELDS.map(item => item.token));
  const profiles = Object.fromEntries(
    Object.entries(input.profiles)
      .filter(([key]) => {
        const [preset, mode, density, extra] = key.split(':');
        return !extra && PRESETS.some(item => item.id === preset) && ['light', 'dark'].includes(mode) && DENSITIES.includes(density);
      })
      .map(([key, values]) => [key, Object.fromEntries(Object.entries(values && typeof values === 'object' ? values : {}).filter(([token, value]) => allowed.has(token) && typeof value === 'string' && value.length <= 256))])
  );
  return { version: 1, appearance: normalizeAppearance(input.appearance), layout: ['standard-admin', 'workspace', 'monitoring'].includes(input.layout) ? input.layout : 'standard-admin', profiles };
}
export function validValue(field, value, supports = CSS.supports) {
  return typeof value === 'string' && value.length <= 256 && !/[;{}]/.test(value) && (!value.trim() || supports(field.property, value));
}
export function readDraft(storage) {
  try {
    return normalizeDraft(JSON.parse(storage.getItem(PREVIEW_STORAGE_KEY)));
  } catch {
    return null;
  }
}
