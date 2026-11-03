// 仅 Gallery 示例的本地异步数据，不是业务 API 或第二套 Mock 系统。
const wait = () => new Promise(resolve => setTimeout(resolve, 500));
export async function loadExample() {
  await wait();
  return { name: '协作空间配置', capacity: 12, category: 'team', startDate: '2026-06-01', endDate: '2026-06-30', enabled: true };
}
export async function saveExample(values, scenario) {
  await wait();
  if (scenario === 'field-error') return { fieldErrors: { name: '该配置名称已存在，请更换名称' } };
  if (scenario === 'failure') throw new Error('保存失败，请稍后重试');
  return { values };
}
