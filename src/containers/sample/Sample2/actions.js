import { createAction, createActionAsync } from 'redux-act-reducer';
import { getArticleListApi, addArticleApi } from './api';

const prefix = 'ARTICLE';

export const GET_ARTICLE_LIST = `${prefix}_GET_ARTICLE_LIST`;
export const CLEAN_LIST = `${prefix}_CLEAN_LIST`;
export const ADD_ARTICLE = `${prefix}_ADD_ARTICLE`;
export const ERROR = `${prefix}_ERROR`;
export const CLEAR_ERROR = `${prefix}_CLEAR_ERROR`;

export const getArticleList = createActionAsync(GET_ARTICLE_LIST, getArticleListApi);
export const cleanList = createAction(CLEAN_LIST);
export const addArticle = createActionAsync(ADD_ARTICLE, addArticleApi);
export const error = createAction(ERROR, 'error');
export const clearError = createAction(CLEAR_ERROR);
