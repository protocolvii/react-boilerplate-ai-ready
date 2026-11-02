export const projectTypes = ['项目', '任务', '资料'];
export const projectPriorities = ['普通', '较高', '紧急'];
export const teams = ['产品团队', '运营团队', '客户支持'];
export const projectStatuses = {
  active: { label: '进行中', tone: 'info' },
  pending: { label: '待处理', tone: 'warning' },
  completed: { label: '已完成', tone: 'success' }
};
export const emptyFilters = { name: '', id: '', owner: '', type: 'all', team: 'all', status: 'all', createdFrom: '', createdTo: '', pendingOnly: false };
const names = ['网站改版计划', '客户反馈整理', '产品资料更新', '季度活动筹备', '帮助中心优化', '团队培训安排', '内容发布计划', '用户调研汇总'];
const owners = ['陈晨', '林悦', '周宁', '李然', '许晴'];
export const initialProjects = Array.from({ length: 32 }, (_, index) => ({
  id: `ITEM-${String(index + 1).padStart(3, '0')}`,
  name: `${names[index % names.length]} · 第${Math.floor(index / names.length) + 1}期`,
  type: projectTypes[index % projectTypes.length],
  team: teams[Math.floor(index / 3) % teams.length],
  status: ['active', 'pending', 'completed'][Math.floor(index / 2) % 3],
  owner: owners[index % owners.length],
  priority: projectPriorities[index % projectPriorities.length],
  progress: Math.floor(index / 2) % 3 === 2 ? 100 : Math.floor(index / 2) % 3 === 1 ? 0 : 35 + (index % 50),
  created: `2026-09-${String((index % 28) + 1).padStart(2, '0')}`,
  deadline: `2026-11-${String((index % 28) + 1).padStart(2, '0')}`,
  notes: ['按计划推进，完成后同步结果', '待补充相关资料与说明', '下一阶段安排评审'][index % 3],
  updated: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`
}));
export function filterProjects(projects, filters) {
  const criteria = { ...emptyFilters, ...filters };
  const name = criteria.name.trim().toLocaleLowerCase();
  const id = criteria.id.trim().toLocaleLowerCase();
  const owner = criteria.owner.trim().toLocaleLowerCase();
  return projects.filter(project => {
    return (
      (!name || project.name.toLocaleLowerCase().includes(name)) &&
      (!id || project.id.toLocaleLowerCase().includes(id)) &&
      (!owner || project.owner.toLocaleLowerCase().includes(owner)) &&
      (criteria.type === 'all' || project.type === criteria.type) &&
      (criteria.team === 'all' || project.team === criteria.team) &&
      (criteria.status === 'all' || project.status === criteria.status) &&
      (!criteria.createdFrom || (!!project.created && project.created >= criteria.createdFrom)) &&
      (!criteria.createdTo || (!!project.created && project.created <= criteria.createdTo)) &&
      (!criteria.pendingOnly || project.status === 'pending')
    );
  });
}
