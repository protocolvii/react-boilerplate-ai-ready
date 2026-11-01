import md5 from 'md5';
import { request } from '../../utils/api';
import { setAuthCache, getAuthCache } from '../../utils/auth';
import { navigateReplace } from '../../utils/navigation';
import cache from '../../utils/cache';
import { selectTokenId } from './selectors';
import { resetState } from './actions';

const loginApi = async (username, password, dispatch, getState) => {
  try {
    const res = await request(
      {
        endpoint: '/authorizations',
        method: 'POST',
        body: {
          username,
          password: md5(password)
        },
        needAuth: false
      },
      dispatch,
      getState
    );
    res.body.receivedAt = new Date();
    await cache.clear();
    await setAuthCache(res.body);
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const refreshTokenApi = async (tokenId, refreshToken, dispatch, getState) => {
  try {
    if (!tokenId || !refreshToken) {
      return Promise.reject({ status: 401, statusText: 'Unauthorized', errcode: 401, errmsg: 'No permission' });
    }
    const res = await request(
      {
        endpoint: `/authorizations/${tokenId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${refreshToken}`
        },
        needAuth: false
      },
      dispatch,
      getState
    );
    res.body.receivedAt = new Date();
    await setAuthCache(res.body);
    return Promise.resolve(res);
  } catch (e) {
    await cache.clear();
    localStorage.removeItem('accessToken');
    dispatch(resetState());
    navigateReplace('/login');
    return Promise.reject(e);
  }
};

const logoutApi = async (dispatch, getState) => {
  let tokenId = selectTokenId(getState());
  if (!tokenId) {
    const auth = await getAuthCache();
    if (auth) {
      tokenId = auth.tokenId;
    }
  }
  await cache.clear();
  localStorage.removeItem('accessToken');
  dispatch(resetState());
  navigateReplace('/login');
  if (tokenId) {
    await request(
      {
        endpoint: `/authorizations/${tokenId}`,
        method: 'DELETE',
        needAuth: false
      },
      dispatch,
      getState
    );
  }
};

const changePasswordApi = async (oldPassword, newPassword, confirmPassword, dispatch, getState) => {
  try {
    const res = await request(
      {
        endpoint: '/user/password',
        method: 'PUT',
        body: {
          old_password: md5(oldPassword),
          new_password: md5(newPassword),
          confirm_password: md5(confirmPassword)
        }
      },
      dispatch,
      getState
    );
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

export { loginApi, logoutApi, refreshTokenApi, changePasswordApi };
