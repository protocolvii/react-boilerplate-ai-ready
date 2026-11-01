import { produce } from 'immer';
import { createReducer } from 'redux-act-reducer';
import { getErrorCode, getErrorMessage } from '../../utils/error';
import { SAVE_AUTH, SET_LOGIN_BACKPATH, SUBMIT, ERROR, CLEAR_ERROR, LOGIN, REFRESH_AUTH_TOKEN, CHANGE_PASSWORD } from './actions';

const defaultState = {
  backpath: '/',
  submitting: false,
  refreshing: false,
  errorcode: 0,
  error: '',
  refreshErrCode: 0,
  refreshErr: undefined,
  lastRefreshAt: new Date('1900/01/01 00:00'),
  optSuccess: false
};

const auth = createReducer(
  {
    [SAVE_AUTH](state, action) {
      return produce(state, draft => {
        Object.assign(draft, action.auth);
      });
    },
    [SET_LOGIN_BACKPATH](state, action) {
      return produce(state, draft => {
        draft.backpath = action.pathname;
      });
    },
    [SUBMIT](state, action) {
      return produce(state, draft => {
        draft.submitting = action.isSubmit;
        draft.errorcode = 0;
        draft.error = '';
      });
    },
    [ERROR](state, action) {
      return produce(state, draft => {
        draft.submitting = false;
        draft.error = action.error;
      });
    },
    [CLEAR_ERROR](state) {
      return produce(state, draft => {
        draft.submitting = false;
        draft.error = '';
        draft.errorcode = 0;
        draft.optSuccess = false;
      });
    },
    [LOGIN](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.submitting = true;
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.tokenId = action.res.body.id;
            draft.accessToken = action.res.body.access_token;
            draft.expiresIn = action.res.body.expires_in;
            draft.refreshToken = action.res.body.refresh_token;
            draft.updatedAt = action.res.body.updated_at;
            draft.createdAt = action.res.body.created_at;
            draft.receivedAt = action.res.body.receivedAt;
            draft.submitting = false;
            draft.error = '';
            draft.errorcode = 0;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.submitting = false;
            draft.error = getErrorMessage(action.err);
            draft.errorcode = getErrorCode(action.err);
          });
        }
      };
    },
    [REFRESH_AUTH_TOKEN](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.refreshing = true;
            draft.lastRefreshAt = new Date();
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.tokenId = action.res.body.id;
            draft.accessToken = action.res.body.access_token;
            draft.expiresIn = action.res.body.expires_in;
            draft.refreshToken = action.res.body.refresh_token;
            draft.updatedAt = action.res.body.updated_at;
            draft.createdAt = action.res.body.created_at;
            draft.receivedAt = action.res.body.receivedAt;
            draft.refreshing = false;
            draft.refreshErrCode = 0;
            draft.refreshErr = undefined;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.refreshing = false;
            draft.refreshErrCode = getErrorCode(action.err);
            draft.refreshErr = getErrorMessage(action.err);
          });
        }
      };
    },
    [CHANGE_PASSWORD](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.submitting = true;
            draft.error = undefined;
            draft.optSuccess = false;
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.submitting = false;
            draft.error = undefined;
            draft.optSuccess = true;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.submitting = false;
            draft.error = getErrorMessage(action.err);
            draft.optSuccess = false;
          });
        }
      };
    }
  },
  defaultState
);

export default auth;
