import hahoorequest from 'hahoorequest/lib/whatwg-fetch';
import { getToken } from '../auth';
import { navigateReplace } from '../navigation';
import config from '../../config';

// Babel CommonJS 产物在不同的 Vite 转换路径下可能保留一层 default。
const hrequest = typeof hahoorequest === 'function' ? hahoorequest : hahoorequest.default;
const apiUrl = config.apiUrl;

const responseError = res => {
  let result = {
    status: 0,
    statusText: '',
    errcode: 1
  };
  if (typeof res === 'string') {
    result = Object.assign(result, { errmsg: res });
  }
  if (typeof res === 'object') {
    result = {
      status: res.status,
      statusText: res.statusText,
      errcode: res.body.errcode,
      errmsg: res.body.errmsg
    };
  }
  return result;
};

const request = async (options, dispatch, getState) => {
  const { url, endpoint, needAuth = true, ...rest } = options;
  const opts = {
    url: url || `${apiUrl}${endpoint}`,
    mode: 'cors',
    ...rest
  };
  if (needAuth) {
    try {
      const token = await getToken(dispatch, getState);
      const headers = opts.headers || {};
      Object.assign(headers, {
        Authorization: `Bearer ${token}`
      });
      opts.headers = headers;
    } catch (e) {
      navigateReplace('/login');
      return Promise.reject(e);
    }
  }
  try {
    const res = await hrequest(opts);

    const { errcode, errmsg } = res.body;
    if ((errcode && errcode !== 0) || (errmsg && errmsg !== 'ok')) {
      if (errcode && (errcode === 100403 || errcode === 100404)) navigateReplace('/login');
      return Promise.reject(responseError(res));
    }
    return Promise.resolve(res);
  } catch (e) {
    const errcode = e.errcode;
    if (errcode && errcode !== 0) {
      if (errcode && (errcode === 100403 || errcode === 100404)) navigateReplace('/login');
    }
    return Promise.reject(e);
  }
};

export { apiUrl, request, responseError, hrequest };
