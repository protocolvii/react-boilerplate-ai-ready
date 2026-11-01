export const getErrorMessage = (err, fallback = '请求失败') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  return err.errmsg || err.message || err.statusText || fallback;
};

export const getErrorCode = (err, fallback = 1) => {
  if (!err) return fallback;
  return err.errcode || err.status || fallback;
};
