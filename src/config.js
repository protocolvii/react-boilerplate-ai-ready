const host = '127.0.0.1';
const hotLoadPort = 3000;

// 在这里集中维护环境差异；业务代码继续从 config 读取配置。
const environments = {
  dev: {
    apiUrl: '/api',
    proxyTarget: 'https://test.api.yourdomain.com'
  },
  staging: {
    apiUrl: 'https://test.api.yourdomain.com'
  },
  prod: {
    apiUrl: 'https://api.yourdomain.com'
  }
};

export const createConfig = (stage = 'dev') => {
  if (!Object.hasOwn(environments, stage)) {
    throw new Error(`Unknown application stage: ${stage}`);
  }

  return {
    host,
    hotLoadPort,
    stage,
    app: {
      title: 'React Boilerplate AI Ready',
      showLogo: true,
      logoSize: 28,
      // 自定义图片可放在 public/branding/，填写 /branding/logo.svg；为空时使用默认 SVG。
      logoSrc: null
    },
    ...environments[stage]
  };
};

// Vite 在客户端编译时替换这个常量，不会向浏览器注入整个 process.env。
export default createConfig(process.env.STAGE || 'dev');
