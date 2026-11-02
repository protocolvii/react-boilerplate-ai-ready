import { selectToken, selectExp, selectTokenId, selectRefreshToken, selectRefreshing, selectRefreshErr, selectLastRefreshAt } from '../../containers/Auth/selectors';
import { saveAuth, refreshAuthToken, logout, resetState } from '../../containers/Auth/actions';
import { refreshTokenApi } from '../../containers/Auth/api';
import { responseError } from '../api';
import cache from '../cache';
import { navigateReplace } from '../navigation';

let invalidatingSession;
// 后端已拒绝会话时，不能只跳登录页而继续保留旧 token。
const invalidateSession = (dispatch, getState, rejectedToken) => {
  if (rejectedToken && rejectedToken !== selectToken(getState())) return Promise.resolve();
  if (!invalidatingSession) {
    invalidatingSession = (async () => {
      try {
        await cache.clear();
      } finally {
        try {
          localStorage.removeItem('accessToken');
        } catch {
          /* 不影响 Redux 清理。 */
        }
        dispatch(resetState());
        navigateReplace('/login');
      }
    })().finally(() => {
      invalidatingSession = undefined;
    });
  }
  return invalidatingSession;
};

const parseAuth = auth => ({
  tokenId: auth.id,
  accessToken: auth.access_token,
  expiresIn: auth.expires_in,
  refreshToken: auth.refresh_token,
  updatedAt: auth.updated_at,
  createdAt: auth.created_at,
  receivedAt: auth.receivedAt
});

const getAuthCache = async () => {
  try {
    const val = await cache.get('auth');
    return Promise.resolve(val);
  } catch (e) {
    return Promise.reject(responseError(e));
  }
};

const setAuthCache = async auth => {
  try {
    const pauth = parseAuth(auth);
    localStorage.setItem('accessToken', pauth.accessToken);
    await cache.set('auth', pauth);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(responseError(e));
  }
};

const refreshAuth = async (tokenId, refreshToken, dispatch, getState) => {
  try {
    const res = await refreshTokenApi(tokenId, refreshToken, dispatch, getState);
    dispatch(saveAuth(parseAuth(res.body)));
    return Promise.resolve(res.body);
  } catch (e) {
    return Promise.reject(e);
  }
};

/* eslint no-param-reassign: 0 */
const getOrRefreshToken = async (dispatch, getState, status) => {
  let token;
  let expires;
  let tokenId;
  let refreshToken;
  let refreshing;
  let refreshErr;
  let lastRefreshAt;
  if (typeof getState === 'function') {
    const state = getState();
    token = selectToken(state);
    expires = selectExp(state);
    tokenId = selectTokenId(state);
    refreshToken = selectRefreshToken(state);
    refreshing = selectRefreshing(state);
    refreshErr = selectRefreshErr(state);
    lastRefreshAt = selectLastRefreshAt(state);
  } else if (typeof getState === 'object') {
    token = getState.token;
    expires = getState.expires;
    tokenId = getState.tokenId;
    refreshToken = getState.refreshToken;
    refreshing = getState.refreshing;
    refreshErr = getState.refreshErr;
    lastRefreshAt = getState.lastRefreshAt;
  }

  if (refreshErr) return Promise.reject(refreshErr);
  if (refreshing) return Promise.resolve('');

  const now = new Date();
  const expired = now.setMinutes(now.getMinutes() + 20);

  if (!lastRefreshAt) {
    lastRefreshAt = new Date('1900/01/01 00:00');
  }

  if (token && expires) {
    if (expires > expired) {
      return Promise.resolve(token);
    }
    if (expires <= expired && !status.isFresh && !refreshing && !refreshErr && tokenId && refreshToken && Math.abs(Math.round((now.getTime() - lastRefreshAt.getTime()) / 1000 / 60)) > 1) {
      status.isFresh = true;
      dispatch(refreshAuthToken(tokenId, refreshToken)).catch(() => {});
    }
  } else {
    const authCache = await getAuthCache();
    if (!authCache) return Promise.reject();

    token = authCache.accessToken;
    tokenId = authCache.tokenId;
    refreshToken = authCache.refreshToken;
    const expiresIn = authCache.expiresIn;
    const receivedAt = authCache.receivedAt;
    if (!tokenId || !refreshToken) return Promise.reject();
    if (token && expiresIn && receivedAt) {
      expires = new Date(Date.parse(receivedAt) + parseInt(expiresIn, 10) * 1000);
      dispatch(saveAuth(authCache));
      if (expires > expired) {
        return Promise.resolve(token);
      }
      if (expires <= expired && !status.isFresh && !refreshing && !refreshErr && tokenId && refreshToken && Math.abs(Math.round((now.getTime() - lastRefreshAt.getTime()) / 1000 / 60)) > 1) {
        status.isFresh = true;
        dispatch(refreshAuthToken(tokenId, refreshToken)).catch(() => {});
      }
    }
  }

  return Promise.resolve('');
};

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

/* eslint no-await-in-loop: 0 */
const getToken = async (dispatch, getState) => {
  let token;
  const status = { isFresh: false };
  for (let i = 0; i < 20; i += 1) {
    try {
      token = await getOrRefreshToken(dispatch, getState, status);
    } catch (e) {
      dispatch(logout()).catch(() => {});
      return Promise.reject(e);
    }

    if (!token) {
      await sleep(1000);
    } else {
      break;
    }
  }

  if (token) {
    return Promise.resolve(token);
  }

  dispatch(logout()).catch(() => {});
  return Promise.reject('get token error');
};

export { invalidateSession, refreshAuth, getAuthCache, setAuthCache, getToken, getOrRefreshToken };
