import { request } from '../../utils/api';

const getMyInfoApi = async (dispatch, getState) => {
  try {
    const res = await request(
      {
        endpoint: '/user',
        method: 'GET'
      },
      dispatch,
      getState
    );
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getMyInfoApi;
