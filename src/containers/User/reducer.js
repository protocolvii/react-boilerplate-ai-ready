import { produce } from 'immer';
import { createReducer } from 'redux-act-reducer';
import { GET_MY_INFO, SET_MAIN_MENU_COLLAPSED } from './actions';
import { getErrorMessage } from '../../utils/error';

const defaultState = {
  scores: 0,
  error: undefined,
  isFetching: false,
  hasRequestedMyInfo: false,
  collapsed: undefined
};

const user = createReducer(
  {
    [SET_MAIN_MENU_COLLAPSED](state, action) {
      return produce(state, draft => {
        draft.collapsed = action.collapsed;
      });
    },
    [GET_MY_INFO](state, action) {
      return {
        REQUEST() {
          return produce(state, draft => {
            draft.isFetching = true;
            draft.hasRequestedMyInfo = true;
            draft.error = undefined;
          });
        },
        SUCCESS() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.id = action.res.body.id;
            draft.uuid = action.res.body.uuid;
            draft.last_login_time = action.res.body.last_login_time;
            draft.last_login_ip = action.res.body.last_login_ip;
            draft.user_type = action.res.body.user_type;
            draft.username = action.res.body.username;
          });
        },
        FAILURE() {
          return produce(state, draft => {
            draft.isFetching = false;
            draft.error = getErrorMessage(action.err);
          });
        }
      };
    }
  },
  defaultState
);

export default user;
