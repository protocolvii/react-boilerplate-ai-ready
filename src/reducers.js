import { combineReducers } from 'redux';

import auth from './containers/Auth/reducer';
import home from './containers/Home/reducer';
import user from './containers/User/reducer';

const appReducer = combineReducers({
  auth,
  home,
  user
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_STATE') {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
