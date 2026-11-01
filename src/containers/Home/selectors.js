import { createSelector } from 'reselect';

const selectHome = state => state.home;

const selectError = createSelector(selectHome, authState => authState.error);

export { selectHome, selectError };
