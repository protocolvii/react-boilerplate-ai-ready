import { request } from '../../utils/api';

const getArticleListApi = async (options, dispatch, getState) => {
  const qs = {
    page: options.page || 1,
    per_page: 10
  };
  if (options.status !== undefined) qs.status = options.status;
  try {
    const res = await request(
      {
        endpoint: '/article',
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

const addArticleApi = async (title, content, dispatch, getState) => {
  try {
    const res = await request(
      {
        endpoint: '/article',
        method: 'POST',
        body: {
          title,
          content
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

export { getArticleListApi, addArticleApi };
