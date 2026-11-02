import { describe, expect, it } from 'vitest';
import { selectExp, selectToken } from '@/containers/Auth/selectors';

describe('登录有效期状态推导', () => {
  it('按收到 token 的时间和有效秒数推导到期时间，支持缓存中的字符串字段', () => {
    const state = { auth: { accessToken: 'example', receivedAt: '2026-11-03T00:00:00.000Z', expiresIn: '7200' } };
    expect(selectToken(state)).toBe('example');
    expect(selectExp(state).toISOString()).toBe('2026-11-03T02:00:00.000Z');
  });
  it('没有完整会话时不提供有效期，刷新 token 后使用新状态重新计算', () => {
    expect(selectExp({ auth: {} })).toBeUndefined();
    expect(selectExp({ auth: { expiresIn: 7200 } })).toBeUndefined();
    const oldState = { auth: { receivedAt: '2026-11-03T00:00:00.000Z', expiresIn: 60 } };
    const refreshed = { auth: { receivedAt: '2026-11-03T00:01:00.000Z', expiresIn: 7200 } };
    expect(selectExp(oldState).toISOString()).toBe('2026-11-03T00:01:00.000Z');
    expect(selectExp(refreshed).toISOString()).toBe('2026-11-03T02:01:00.000Z');
  });
});
