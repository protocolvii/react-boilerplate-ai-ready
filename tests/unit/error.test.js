import { describe, expect, it } from 'vitest';
import { getErrorCode, getErrorMessage } from '@/utils/error';

describe('错误反馈工具', () => {
  it('优先使用业务错误信息，并兼容 Error、字符串和 HTTP 错误', () => {
    expect(getErrorMessage({ errmsg: '名称已存在', message: 'generic', statusText: 'Bad Request' })).toBe('名称已存在');
    expect(getErrorMessage(new Error('保存失败'))).toBe('保存失败');
    expect(getErrorMessage('网络异常')).toBe('网络异常');
    expect(getErrorMessage({ statusText: 'Unauthorized' })).toBe('Unauthorized');
  });
  it('缺失错误内容时使用调用方兜底，并正确提取业务和 HTTP 错误码', () => {
    expect(getErrorMessage(null, '请稍后重试')).toBe('请稍后重试');
    expect(getErrorMessage({})).toBe('请求失败');
    expect(getErrorCode({ errcode: 100403, status: 401 })).toBe(100403);
    expect(getErrorCode({ status: 503 })).toBe(503);
    expect(getErrorCode(null, -1)).toBe(-1);
  });
});
