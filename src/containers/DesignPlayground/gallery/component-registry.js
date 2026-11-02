import { lazy } from 'react';
const basic = name => lazy(() => import('./previews/BasicPreviews.js').then(module => ({ default: module[name] })));
const business = name => lazy(() => import('./previews/BusinessPreviews.js').then(module => ({ default: module[name] })));

// preview 是真实 React 组件；同一组密切相关的基础组件可共用一个示例。
export const componentRegistry = [
  { id: 'buttons', name: '按钮与操作', category: 'Basic', description: 'Button 的变体、尺寸、禁用与加载状态，以及 Tooltip。', tags: ['Button', 'Tooltip'], preview: basic('ButtonPreview') },
  { id: 'inputs', name: '输入与校验', category: 'Form', description: 'Input、Textarea、Label 与错误关联。', tags: ['Input', 'Textarea', 'Label'], preview: basic('InputPreview') },
  { id: 'choices', name: '选择与开关', category: 'Form', description: 'Select、Checkbox、RadioGroup、Switch 的受控交互。', tags: ['Select', 'Checkbox', 'RadioGroup', 'Switch'], preview: basic('ChoicePreview') },
  { id: 'overlays', name: '浮层与对话框', category: 'Feedback', description: 'Dialog、Sheet、Popover、Alert 与键盘操作。', tags: ['Dialog', 'Sheet', 'Popover', 'Alert'], preview: basic('OverlayPreview') },
  { id: 'status', name: '状态与反馈', category: 'Feedback', description: '独立状态语义、Badge 与失败反馈。', tags: ['StatusIndicator', 'Badge', 'Alert'], preview: basic('StatusPreview') },
  { id: 'tabs', name: '选项卡与占位', category: 'Basic', description: 'Tabs、Skeleton、Separator 的状态展示。', tags: ['Tabs', 'Skeleton', 'Separator'], preview: basic('TabsPreview') },
  { id: 'card', name: '卡片容器', category: 'Basic', description: 'Card 的标题、内容与操作区域。', tags: ['Card'], preview: basic('CardPreview') },
  { id: 'page-header', name: '页面标题', category: 'Business', description: 'PageHeader 的面包屑、说明与操作区。', tags: ['PageHeader', 'Breadcrumb'], preview: business('HeaderPreview') },
  { id: 'section-header', name: '区块标题', category: 'Business', description: 'SectionHeader 表达页面内部的信息层级。', tags: ['SectionHeader'], preview: business('SectionPreview') },
  { id: 'metric-card', name: '统计指标', category: 'Business', description: 'MetricCard 的指标、说明和数据排版。', tags: ['MetricCard'], preview: business('MetricPreview') },
  { id: 'empty-state', name: '空状态', category: 'Feedback', description: 'EmptyState 提供清晰的下一步操作。', tags: ['EmptyState'], preview: business('EmptyPreview') },
  { id: 'search-toolbar', name: '搜索与筛选', category: 'Business', description: 'SearchToolbar 与 FilterBar 区分输入草稿和已提交查询。', tags: ['SearchToolbar', 'FilterBar'], preview: business('SearchPreview') },
  { id: 'data-table', name: '通用表格', category: 'Business', description: 'DataTable 的排序、分页、加载、失败与空状态。', tags: ['DataTable', 'Table', 'Pagination'], preview: business('TablePreview') },
  { id: 'confirm-dialog', name: '确认操作', category: 'Feedback', description: 'ConfirmDialog 的成功与失败状态。', tags: ['ConfirmDialog', 'AlertDialog'], preview: business('ConfirmPreview') },
  { id: 'form', name: '表单组合', category: 'Form', description: 'FormBox、原生 form、浏览器校验与提交反馈。', tags: ['FormBox', 'Input', 'Label', 'Button'], preview: business('FormPreview') }
];
