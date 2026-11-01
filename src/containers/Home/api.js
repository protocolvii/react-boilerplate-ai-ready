import { request } from '../../utils/api';

const getScoreListApi = async (options, dispatch, getState) => {
  const qs = {
    page: options.page || 1,
    per_page: 10
  };
  if (options.userId) qs.user_id = options.userId;
  if (options.mobile) qs.mobile = options.mobile;
  if (options.status !== undefined) qs.status = options.status;
  try {
    const res = await request(
      {
        endpoint: '/scores',
        method: 'GET',
        qs
      },
      dispatch,
      getState
    );
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

const addScoreApi = async (userId, score, dispatch, getState) => {
  try {
    const res = await request(
      {
        endpoint: '/scores',
        method: 'POST',
        body: {
          user_id: userId,
          score
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

export { getScoreListApi, addScoreApi };
