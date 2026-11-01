import { createAction, createActionAsync } from 'redux-act-reducer';
import { loginApi, refreshTokenApi, logoutApi, changePasswordApi } from './api';

const prefix = 'AUTH';

export const SAVE_AUTH = `${prefix}_SAVE_AUTH`;
export const SET_LOGIN_BACKPATH = `${prefix}_SET_LOGIN_BACKPATH`;
export const SUBMIT = `${prefix}_SUBMIT`;
export const ERROR = `${prefix}_ERROR`;
export const LOGIN = `${prefix}_LOGIN`;
export const REFRESH_AUTH_TOKEN = `${prefix}_REFRESH_AUTH_TOKEN`;
export const LOGOUT = `${prefix}_LOGOUT`;
export const CLEAR_ERROR = `${prefix}_CLEAR_ERROR`;
export const CHANGE_PASSWORD = `${prefix}_CHANGE_PASSWORD`;

export const saveAuth = createAction(SAVE_AUTH, 'auth');
export const setLoginBackPath = createAction(SET_LOGIN_BACKPATH, 'pathname');
export const submit = createAction(SUBMIT, 'isSubmit');
export const error = createAction(ERROR, 'error');
export const login = createActionAsync(LOGIN, loginApi);
export const refreshAuthToken = createActionAsync(REFRESH_AUTH_TOKEN, refreshTokenApi);
export const logout = createActionAsync(LOGOUT, logoutApi);
export const resetState = createAction('RESET_STATE');
export const clearError = createAction(CLEAR_ERROR);
export const changePassword = createActionAsync(CHANGE_PASSWORD, changePasswordApi);
