import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';

/* eslint no-underscore-dangle: 0 */
export default function configureStore(initialState) {
  const composeEnhancers = (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
  const middleware = composeEnhancers(applyMiddleware(thunk));

  const store = createStore(rootReducer, initialState, middleware);

  return store;
}
