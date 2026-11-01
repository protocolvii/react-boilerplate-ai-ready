export const initialProjects = [
  { id: 'PRJ-001', name: '知识库内容索引', owner: '陈思远', initials: '陈', status: 'active', updated: '2026-11-02', kind: '知识管理' },
  { id: 'PRJ-002', name: '设备告警摘要', owner: '林晓', initials: '林', status: 'review', updated: '2026-11-01', kind: '工业智能' },
  { id: 'PRJ-003', name: '客户洞察报告', owner: '王一宁', initials: '王', status: 'active', updated: '2026-10-31', kind: '数据分析' },
  { id: 'PRJ-004', name: '质量巡检助手', owner: '赵明', initials: '赵', status: 'draft', updated: '2026-10-30', kind: '生产管理' },
  { id: 'PRJ-005', name: '供应链需求预测', owner: '林晓', initials: '林', status: 'active', updated: '2026-10-29', kind: '数据分析' },
  { id: 'PRJ-006', name: '研发文档检索', owner: '陈思远', initials: '陈', status: 'draft', updated: '2026-10-28', kind: '知识管理' },
  { id: 'PRJ-007', name: '生产能耗分析', owner: '王一宁', initials: '王', status: 'review', updated: '2026-10-27', kind: '工业智能' },
  { id: 'PRJ-008', name: '服务工单分类', owner: '赵明', initials: '赵', status: 'active', updated: '2026-10-26', kind: '客户服务' }
];
export const projectStatuses = { active: { label: '运行中', tone: 'success' }, review: { label: '待审核', tone: 'warning' }, draft: { label: '草稿', tone: 'neutral' } };
export const devices = [
  { id: 'VOC-001', location: '反应车间 A', status: '在线', tone: 'success', value: '32.4' },
  { id: 'VOC-002', location: '反应车间 B', status: '在线', tone: 'success', value: '28.6' },
  { id: 'VOC-003', location: '废气处理站', status: '告警', tone: 'warning', value: '58.2' },
  { id: 'VOC-004', location: '溶剂存储区', status: '在线', tone: 'success', value: '19.8' },
  { id: 'VOC-005', location: '包装车间', status: '离线', tone: 'neutral', value: '—' },
  { id: 'VOC-006', location: '排放口东区', status: '在线', tone: 'success', value: '24.1' }
];
