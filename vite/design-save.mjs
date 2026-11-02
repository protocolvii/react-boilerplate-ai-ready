import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { format } from 'prettier';
import { createHash } from 'node:crypto';
import { FIELDS, normalizeDraft } from '../src/containers/DesignPlayground/preview/fields.js';

export const DESIGN_ENDPOINT = '/__design-project';
const paths = ['src/design-system/project-design.json', 'src/design-system/tokens/project.css'];
const revision = files => createHash('sha256').update(files.join('\0')).digest('hex');

export function prepareDesign(input, current, replaceProfiles = false) {
  const normalized = normalizeDraft(input);
  if (!normalized || JSON.stringify(normalized.appearance) !== JSON.stringify(input.appearance) || normalized.layout !== input.layout) throw new Error('无效的外观或布局配置');
  if (Object.keys(normalized.profiles).length !== Object.keys(input.profiles).length) throw new Error('无效的主题分组');
  const allowed = new Set(FIELDS.map(field => field.token));
  const profiles = replaceProfiles ? {} : structuredClone(current.profiles);
  for (const [key, tokens] of Object.entries(input.profiles)) {
    if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) throw new Error('无效的 Token 分组');
    profiles[key] ||= {};
    for (const [token, value] of Object.entries(tokens)) {
      // 禁止脱离 CSS 声明、引用外部资源或通过转义绕过检查。
      if (!allowed.has(token) || typeof value !== 'string' || value.length > 256 || /[;{}<>@\\\n\r]|\/\*|url\s*\(|image-set\s*\(/i.test(value)) throw new Error('无效的 Token 值');
      if (value.trim()) profiles[key][token] = value.trim();
      else delete profiles[key][token];
    }
    if (!Object.keys(profiles[key]).length) delete profiles[key];
  }
  const design = { version: normalized.version, appearance: normalized.appearance, layout: normalized.layout, profiles };
  const css =
    '/* 由设计配置“保存到项目”生成；可通过 Git 审核与撤销。 */\n' +
    Object.entries(profiles)
      .sort()
      .map(([key, tokens]) => {
        const [theme, mode, density] = key.split(':');
        return `:root[data-theme="${theme}"][data-color-mode="${mode}"][data-density="${density}"] {\n${Object.entries(tokens)
          .sort()
          .map(([token, value]) => `  ${token}: ${value};`)
          .join('\n')}\n}\n`;
      })
      .join('\n');
  return [JSON.stringify(design, null, 2) + '\n', css];
}

export function designSave() {
  let busy = false;
  return {
    name: 'design-project-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== DESIGN_ENDPOINT) return next();
        const reply = (status, body) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };
        if (req.headers.origin && !['http:', 'https:'].some(protocol => req.headers.origin === `${protocol}//${req.headers.host}`)) return reply(403, { error: '仅允许当前开发站点保存' });
        if (req.headers['sec-fetch-site'] === 'cross-site') return reply(403, { error: '拒绝跨站保存' });
        const files = paths.map(path => resolve(server.config.root, path));
        if (req.method === 'GET') {
          try {
            const contents = await Promise.all(files.map(path => readFile(path, 'utf8')));
            return reply(200, { revision: revision(contents), config: JSON.parse(contents[0]) });
          } catch {
            return reply(500, { error: '无法读取项目设计配置' });
          }
        }
        if (req.method !== 'POST') return reply(405, { error: '不支持的请求方法' });
        if (req.headers['content-type'] !== 'application/json') return reply(415, { error: '仅支持 JSON' });
        if (busy) return reply(409, { error: '正在保存，请稍后重试' });
        busy = true;
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 65536) {
              reply(413, { error: '配置过大' });
              return;
            }
          }
          let input;
          try {
            input = JSON.parse(body);
          } catch {
            return reply(400, { error: '无效的 JSON' });
          }
          const previous = await Promise.all(files.map(path => readFile(path, 'utf8')));
          if (input.revision !== revision(previous)) return reply(409, { error: '项目配置已被修改，请刷新页面后重试，避免覆盖其他改动' });
          let output;
          try {
            if (input.replaceProfiles !== undefined && typeof input.replaceProfiles !== 'boolean') throw new Error('无效的恢复模式');
            output = prepareDesign(input.config, JSON.parse(previous[0]), input.replaceProfiles === true);
            output = await Promise.all(output.map((text, i) => format(text, { parser: i === 0 ? 'json' : 'css', singleQuote: true })));
          } catch (error) {
            return reply(400, { error: error.message });
          }
          try {
            for (let i = 0; i < files.length; i++) await writeFile(files[i], output[i]);
          } catch {
            await Promise.all(files.map((path, i) => writeFile(path, previous[i])));
            return reply(500, { error: '写入失败，已恢复原配置' });
          }
          reply(200, { revision: revision(output), files: paths });
        } catch {
          reply(500, { error: '保存失败，请检查文件权限' });
        } finally {
          busy = false;
        }
      });
    }
  };
}
