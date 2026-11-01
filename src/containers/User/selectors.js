import { createSelector } from 'reselect';

const selectUser = state => state.user;

const selectCollapsed = createSelector(selectUser, userState => userState.collapsed);

export { selectUser, selectCollapsed };
