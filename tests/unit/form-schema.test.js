import { describe, expect, it } from 'vitest';
import { formSchema } from '@/containers/DesignPlayground/gallery/previews/FormExample/schema';
const valid = { name: '通用配置', capacity: '12', category: 'team', startDate: '2026-06-01', endDate: '2026-06-30', enabled: true };

describe('表单业务校验', () => {
  it('去除文本空格并转换数字字符串，保持开关布尔值', () => {
    expect(formSchema.parse({ ...valid, name: ' 通用配置 ', capacity: ' 12 ' })).toEqual({ ...valid, capacity: 12 });
  });
  it.each(['', ' ', null, undefined, NaN, 'abc', true, [], '0', '-1', '1.5', '101'])('拒绝无效数量：%s', capacity => {
    const result = formSchema.safeParse({ ...valid, capacity });
    expect(result.success).toBe(false);
    expect(result.error.issues.some(issue => issue.path[0] === 'capacity')).toBe(true);
  });
  it.each([{ name: '' }, { name: 'a' }, { name: 'a'.repeat(41) }, { category: '' }, { category: 'unknown' }, { startDate: '' }, { startDate: '2026-02-30' }, { endDate: '2026-05-31' }, { capacity: 1 }])(
    '拒绝必填、长度、枚举、日期或跨字段错误：%o',
    change => {
      expect(formSchema.safeParse({ ...valid, ...change }).success).toBe(false);
    }
  );
  it('个人类型允许 1，数量上界与相同日期有效', () => {
    expect(formSchema.safeParse({ ...valid, category: 'personal', capacity: 1 }).success).toBe(true);
    expect(formSchema.safeParse({ ...valid, capacity: 100, endDate: valid.startDate }).success).toBe(true);
  });
});
