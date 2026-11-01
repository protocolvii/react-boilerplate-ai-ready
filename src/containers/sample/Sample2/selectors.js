import { createSelector } from 'reselect';

const selectArticle = state => state.article;

const selectError = createSelector(selectArticle, stateData => stateData.error);

export { selectArticle, selectError };
