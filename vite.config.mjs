import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import autoprefixer from 'autoprefixer';
import postcssMixins from 'postcss-mixins';
import postcssSimpleVars from 'postcss-simple-vars';
import postcssNested from 'postcss-nested';
import { createConfig } from './src/config.js';
import { sourceConventions } from './vite/source-conventions.mjs';
import { designSave } from './vite/design-save.mjs';
import { mockApi } from './vite/mock-api.mjs';
import { getAppearanceBootstrapScript } from './src/design-system/appearance/settings.js';

const htmlEntry = fileURLToPath(new URL('./index.html', import.meta.url));
const htmlTemplate = fileURLToPath(new URL('./src/template/index.html', import.meta.url));

const stages = { development: 'dev', mock: 'dev', staging: 'staging', production: 'prod' };
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export default defineConfig(({ command, mode, isPreview }) => {
  const isMock = mode === 'mock';
  if (isMock && (command !== 'serve' || isPreview)) throw new Error('mock 模式仅用于 npm run dev:mock，不能用于构建或预览。');
  const stage = process.env.STAGE || stages[mode];
  if (!stage) throw new Error(`Unknown Vite mode: ${mode}. Use development, staging or production, or set STAGE.`);
  if (isMock && stage !== 'dev') throw new Error('mock 模式仅支持 dev 环境，请移除 STAGE 环境变量。');
  const config = createConfig(stage);
  if (isMock && config.apiUrl !== '/api') throw new Error('mock 模式要求 dev.apiUrl 为 /api。');
  const isBuild = command === 'build';

  return {
    plugins: [
      ...(!isBuild && !isPreview ? [designSave()] : []),
      ...(isMock ? [mockApi()] : []),
      sourceConventions(),
      react(),
      tailwindcss(),
      {
        name: 'app-html-template',
        // 虚拟根 HTML 入口：模板仍放在 src/template，产物仍为 build/static/index.html。
        resolveId(id) {
          if (id === htmlEntry) return htmlEntry;
        },
        async load(id) {
          if (id !== htmlEntry) return;
          this.addWatchFile(htmlTemplate);
          return readFile(htmlTemplate, 'utf8');
        },
        configureServer(server) {
          server.watcher.add(htmlTemplate);
          server.watcher.on('change', file => {
            if (file === htmlTemplate) server.ws.send({ type: 'full-reload', path: '*' });
          });
          // 在 Vite 的 SPA 回退后读取模板，/login 等深层路由也使用同一入口。
          return () => {
            server.middlewares.use(async (req, res, next) => {
              if (req.url?.split('?')[0] !== '/index.html') return next();
              try {
                const html = await server.transformIndexHtml('/index.html', await readFile(htmlTemplate, 'utf8'), req.originalUrl);
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache');
                res.end(html);
              } catch (error) {
                next(error);
              }
            });
          };
        },
        transformIndexHtml: {
          order: 'pre',
          handler: html => ({
            html: html.replaceAll('%APP_TITLE%', escapeHtml(config.app.title)),
            tags: [{ tag: 'script', children: getAppearanceBootstrapScript(), injectTo: 'head-prepend' }]
          })
        }
      }
    ],
    // 依赖扫描也需识别 .js 中的 JSX，否则首次启动会在扫描阶段失败。
    optimizeDeps: { rolldownOptions: { moduleTypes: { '.js': 'jsx' } } },
    define: { 'process.env.STAGE': JSON.stringify(stage) },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'redux-act-reducer': fileURLToPath(new URL('./node_modules/redux-act-reducer/src', import.meta.url))
      }
    },
    css: {
      modules: { scopeBehaviour: 'local', generateScopedName: '[name]__[local]___[hash:base64:5]' },
      devSourcemap: !isBuild,
      postcss: { plugins: [postcssMixins(), postcssSimpleVars(), postcssNested(), autoprefixer()] }
    },
    server: {
      host: config.host,
      // 模拟模式使用独立端口，避免与真实接口开发共享浏览器登录缓存。
      port: isMock ? config.hotLoadPort + 1 : config.hotLoadPort,
      strictPort: true,
      proxy:
        !isMock && config.proxyTarget
          ? {
              '^/api(?:/|$)': {
                target: config.proxyTarget,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api(?=\/|$)/, '') || '/'
              }
            }
          : undefined
    },
    build: {
      outDir: 'build/static',
      emptyOutDir: true,
      target: 'es2022',
      sourcemap: false,
      cssCodeSplit: true,
      assetsInlineLimit: (filePath, content) => !/\.(ttf|eot)$/i.test(filePath) && content.length < 8192
    }
  };
});
