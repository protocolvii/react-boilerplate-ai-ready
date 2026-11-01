import { produce } from 'immer';
import { createReducer } from 'redux-act-reducer';
import { getErrorMessage } from '../../../utils/error';
import { CLEAN_LIST, GET_ARTICLE_LIST, ADD_ARTICLE, ERROR, CLEAR_ERROR } from './actions';

const defaultState = {
  isFetching: false,
  error: undefined,
  items: [],
  page: 1,
  page_count: 1,
  per_page: 10,
  record_count: 0
};

const r = createReducer(
  {
    [ERROR](state, action) {
      return produce(state, draft => {
        draft.error = action.error;
      });
    },
    [CLEAR_ERROR](state) {
      return produce(state, draft => {
        draft.error = '';
        draft.errorcode = 0;
      });
    },
    [CLEAN_LIST](state) {
      return produce(state, draft => {
        draft.page = 1;
        draft.page_count = 1;
        draft.per_page = 10;
        draft.record_count = 0;
        draft.items = [];
      });
    },
    [GET_ARTICLE_LIST](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.isFetching = true;
            draft.error = undefined;
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.error = undefined;
            Object.keys(action.res.body).forEach(v => {
              draft[v] = action.res.body[v];
            });
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.error = getErrorMessage(action.err);
          });
        }
      };
    },
    [ADD_ARTICLE](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.isFetching = true;
            draft.error = undefined;
            draft.editSuccess = false;
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.error = undefined;
            draft.editSuccess = true;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.error = getErrorMessage(action.err);
            draft.editSuccess = false;
          });
        }
      };
    }
  },
  defaultState
);

export default r;
