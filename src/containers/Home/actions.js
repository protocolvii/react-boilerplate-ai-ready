import { createAction, createActionAsync } from 'redux-act-reducer';
import { getScoreListApi, addScoreApi } from './api';

const prefix = 'Home';

export const GET_SCORE_LIST = `${prefix}_GET_SCORE_LIST`;
export const CLEAN_LIST = `${prefix}_CLEAN_LIST`;
export const ADD_SCORE = `${prefix}_ADD_SCORE`;
export const ERROR = `${prefix}_ERROR`;
export const CLEAR_ERROR = `${prefix}_CLEAR_ERROR`;

export const getScoreList = createActionAsync(GET_SCORE_LIST, getScoreListApi);
export const cleanList = createAction(CLEAN_LIST);
export const addScore = createActionAsync(ADD_SCORE, addScoreApi);
export const error = createAction(ERROR, 'error');
export const clearError = createAction(CLEAR_ERROR);
