import { lazy } from 'react';
const page = name => lazy(() => import('./previews/PagePreviews.js').then(module => ({ default: module[name] })));

// layout 是推荐布局，实际渲染复用 Playground 外层 PageLayout，不重复挂载导航。
export const pageRegistry = [
  {
    id: 'data',
    name: 'Dashboard / 数据管理',
    category: 'Data Management',
    description: '指标、搜索筛选、排序分页、编辑与归档，适用于管理列表。',
    tags: ['Dashboard', 'DataTable', 'Form'],
    layout: 'standard-admin',
    preview: page('DataManagementPreview')
  },
  { id: 'monitoring', name: '工业监测', category: 'Monitoring', description: '设备状态、趋势图与告警，适用于设备运维与监测页面。', tags: ['Charts', 'Industrial', 'Status'], layout: 'monitoring', preview: page('MonitoringPreview') },
  { id: 'workspace', name: 'AI 工作台', category: 'AI Workspace', description: '静态任务结果、资源与工具面板，适用于知识工作区；不连接 AI。', tags: ['Workspace', 'Static'], layout: 'workspace', preview: page('WorkspacePreview') }
];
