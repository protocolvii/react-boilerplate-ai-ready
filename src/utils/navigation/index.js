let navigate;

export const setNavigate = nextNavigate => {
  navigate = nextNavigate;
};

export const navigateTo = (to, options = {}) => {
  if (navigate) {
    navigate(to, options);
    return;
  }

  if (options.replace) {
    window.location.replace(to);
    return;
  }

  window.location.assign(to);
};

export const navigateReplace = to => {
  // 多个失败请求可能重复要求登录，不覆盖首次保存的来源。
  if (to === '/login' && window.location.pathname === '/login') return;
  const options = { replace: true };
  // 请求层要求登录时保留当前目的地，登录恢复后不能一律返回首页。
  if (to === '/login' && window.location.pathname !== '/login') {
    options.state = { from: { pathname: window.location.pathname, search: window.location.search, hash: window.location.hash } };
  }
  navigateTo(to, options);
};

export const getLoginDestination = from => {
  if (!from || typeof from.pathname !== 'string' || !from.pathname.startsWith('/') || from.pathname.startsWith('//') || from.pathname.includes('\\') || from.pathname === '/login') return '/';
  return { pathname: from.pathname, search: typeof from.search === 'string' ? from.search : '', hash: typeof from.hash === 'string' ? from.hash : '' };
};
