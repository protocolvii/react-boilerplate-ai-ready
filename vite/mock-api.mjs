import { createHash, randomUUID } from 'node:crypto';

const hash = value => createHash('md5').update(value).digest('hex');
const expiresIn = 7200;

// 只模拟现有鉴权协议，业务接口按实际页面需求另行添加。
export function createMockMiddleware(state = { sessions: new Map(), password: hash('admin123') }) {
  const { sessions } = state;

  const respond = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  };
  const ok = (res, data = {}) => respond(res, 200, { errcode: 0, errmsg: 'ok', ...data });
  const fail = (res, status, errmsg, errcode = status) => respond(res, status, { errcode, errmsg });
  const token = req => req.headers.authorization?.replace(/^Bearer /, '');
  const createSession = () => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (session.expiresAt <= now) sessions.delete(id);
    }
    const session = { id: randomUUID(), accessToken: randomUUID(), refreshToken: randomUUID(), expiresAt: now + expiresIn * 1000 };
    sessions.set(session.id, session);
    return session;
  };
  const authData = session => ({
    id: session.id,
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_in: expiresIn,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const readJson = async req => {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 65536) throw new Error('请求体过大');
    }
    const parsed = JSON.parse(body || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('请求体必须为 JSON 对象');
    return parsed;
  };

  return async (req, res, next) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (!/^\/api(?:\/|$)/.test(pathname)) return next();
    const path = pathname.slice(4).replace(/\/+$/, '') || '/';
    try {
      if (path === '/authorizations' && req.method === 'POST') {
        const body = await readJson(req);
        if (body.username !== 'admin' || body.password !== state.password) return fail(res, 400, '用户名或密码错误');
        return ok(res, authData(createSession()));
      }

      const authorization = /^\/authorizations\/([^/]+)$/.exec(path);
      if (authorization && req.method === 'DELETE') {
        sessions.delete(authorization[1]);
        return ok(res);
      }
      if (authorization && req.method === 'PUT') {
        const session = sessions.get(authorization[1]);
        if (!session || session.refreshToken !== token(req) || session.expiresAt <= Date.now()) return fail(res, 401, '登录已过期，请重新登录', 100403);
        sessions.delete(session.id);
        return ok(res, authData(createSession()));
      }

      if ((path === '/user' && req.method === 'GET') || (path === '/user/password' && req.method === 'PUT')) {
        const session = [...sessions.values()].find(item => item.accessToken === token(req) && item.expiresAt > Date.now());
        if (!session) return fail(res, 401, '请先登录', 100403);
        if (path === '/user') {
          return ok(res, { id: 1, uuid: 'mock-user-admin', username: 'admin', user_type: 'admin', last_login_time: new Date().toISOString(), last_login_ip: '127.0.0.1' });
        }
        const body = await readJson(req);
        if (body.old_password !== state.password) return fail(res, 400, '原密码错误');
        if (typeof body.new_password !== 'string' || !/^[a-f0-9]{32}$/.test(body.new_password) || body.new_password !== body.confirm_password) return fail(res, 400, '新密码与确认密码不一致');
        state.password = body.new_password;
        return ok(res);
      }

      return fail(res, 404, `尚未配置模拟接口：${req.method} ${path}`);
    } catch (error) {
      return fail(res, 400, error instanceof SyntaxError ? '请求体不是有效 JSON' : error.message);
    }
  };
}

export function mockApi() {
  return {
    name: 'app-mock-api',
    apply: 'serve',
    configureServer(server) {
      // Vite 配置重载会重新创建插件；会话在同一进程、同一项目内延续。
      const key = Symbol.for('react-boilerplate:mock-api');
      const stores = (globalThis[key] ||= new Map());
      const root = server.config.root;
      if (!stores.has(root)) stores.set(root, { sessions: new Map(), password: hash('admin123') });
      server.config.logger.info('[mock] 本地模拟后端已启用，账号：admin；初始密码：admin123。Vite 重载保留会话，停止进程后重置。');
      server.middlewares.use(createMockMiddleware(stores.get(root)));
    }
  };
}
