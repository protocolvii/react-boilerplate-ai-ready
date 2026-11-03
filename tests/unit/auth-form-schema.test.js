import { describe, expect, it } from 'vitest';
import { loginSchema, changePasswordSchema } from '@/containers/Auth/schema';

describe('账号表单校验', () => {
  it('登录拒绝缺失账号和密码，用户名 trim，密码保持原值', () => {
    expect(loginSchema.safeParse({ username: ' ', password: '' }).success).toBe(false);
    expect(loginSchema.parse({ username: ' admin ', password: ' password ' })).toEqual({ username: 'admin', password: ' password ' });
  });
  it.each([{ oldpassword: '' }, { password: '123', repassword: '123' }, { password: 'x'.repeat(21), repassword: 'x'.repeat(21) }, { repassword: '' }, { repassword: 'other-password' }])('修改密码拒绝必填、长度和两次不一致：%o', change => {
    expect(changePasswordSchema.safeParse({ oldpassword: 'old', password: 'newpass', repassword: 'newpass', ...change }).success).toBe(false);
  });
  it('不增加旧密码长度限制，不去除新密码中的空格', () => {
    const values = { oldpassword: 'old', password: ' pass ', repassword: ' pass ' };
    expect(changePasswordSchema.parse(values)).toEqual(values);
  });
});
