import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码')
});
const newPassword = z.string().min(1, '请输入新密码').min(6, '新密码至少 6 位').max(20, '新密码最多 20 位');
export const changePasswordSchema = z
  .object({
    oldpassword: z.string().min(1, '请输入原密码'),
    password: newPassword,
    repassword: z.string().min(1, '请再次输入新密码').min(6, '确认密码至少 6 位').max(20, '确认密码最多 20 位')
  })
  .refine(values => values.password === values.repassword, { path: ['repassword'], message: '两次密码输入不一致' });
