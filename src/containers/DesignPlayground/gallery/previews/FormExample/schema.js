import { z } from 'zod';

// 输入阶段保留字符串；不要让 Number('') / Number(null) 将缺失值变成合法的 0。
const numberInput = value => {
  if (typeof value === 'string') return value.trim() === '' ? undefined : Number(value);
  return value === null ? undefined : value;
};
const date = z.string().min(1, '请选择日期').pipe(z.iso.date('请输入有效日期'));
export const formSchema = z
  .object({
    name: z.string().trim().min(1, '请输入配置名称').min(2, '配置名称至少 2 个字符').max(40, '配置名称最多 40 个字符'),
    capacity: z.preprocess(numberInput, z.number({ error: '请输入有效数量' }).int('数量必须是整数').min(1, '数量不能小于 1').max(100, '数量不能大于 100')),
    category: z.enum(['personal', 'team'], { error: '请选择配置类型' }),
    startDate: date,
    endDate: date,
    enabled: z.boolean()
  })
  .refine(values => values.endDate >= values.startDate, { message: '结束日期不能早于开始日期', path: ['endDate'] })
  .refine(values => values.category !== 'team' || values.capacity >= 2, { message: '团队配置数量至少为 2', path: ['capacity'] });

export const defaultValues = { name: '', capacity: '', category: '', startDate: '', endDate: '', enabled: true };
