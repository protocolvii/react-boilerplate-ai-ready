/* eslint-disable import/no-import-module-exports */
import React from 'react';
import { createRoot } from 'react-dom/client';
import configureStore from './store';
import Root from './containers/Root';

/* eslint no-underscore-dangle: 0 */
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);

const root = createRoot(document.getElementById('container'));
root.render(<Root store={store} />);
