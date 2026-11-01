import { fileURLToPath } from 'node:url';
import { transformWithOxc } from 'vite';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const globalStyles = fileURLToPath(new URL('../src/assets/css/main.css', import.meta.url));

// 保留旧项目的 .js / .css 命名；仅在 Vite 内部标记 CSS Modules。
export function sourceConventions() {
  let refresh;
  return {
    name: 'app-source-conventions',
    enforce: 'pre',
    configResolved(config) {
      refresh = config.command === 'serve' && !config.isProduction && config.server.hmr !== false;
    },
    async resolveId(source, importer, options) {
      if (!source.split('?')[0].endsWith('.css') || source.includes('?')) return;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved || !resolved.id.startsWith(sourceRoot) || resolved.id === globalStyles) return;
      // 文件本身仍为 .css；Vite 原生模块识别使用此查询标记，文件监听仍指向原文件。
      return { ...resolved, id: `${resolved.id}?.module.css` };
    },
    async transform(code, id) {
      const file = id.split('?')[0];
      if (!file.startsWith(sourceRoot) || !file.endsWith('.js')) return;
      return transformWithOxc(code, file, { lang: 'jsx', jsx: { runtime: 'automatic', refresh } });
    }
  };
}
