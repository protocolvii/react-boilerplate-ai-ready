import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
});

// jsdom 没有布局观察接口；Radix Switch / Popover Arrow 需要它来挂载。
// 不模拟尺寸和定位，真实浮层避让由 Playwright 验证。
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  }
});
afterAll(() => vi.unstubAllGlobals());
