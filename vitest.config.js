import { defineConfig } from 'vitest/config';
import createViteConfig from './vite.config.mjs';

const app = createViteConfig({ command: 'serve', mode: 'development', isPreview: false });

export default defineConfig({
  // 共享实际编译、别名和环境定义，不启动 HTML、Mock 或源码写入服务。
  plugins: app.plugins.filter(plugin => !['app-html-template', 'design-project-save'].includes(plugin.name)),
  resolve: app.resolve,
  define: app.define,
  css: app.css,
  server: { hmr: false },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js', 'tests/components/**/*.test.jsx'],
    setupFiles: ['./tests/setup.js'],
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    maxWorkers: 2
  }
});
