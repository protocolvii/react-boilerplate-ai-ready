import { createAction, createActionAsync } from 'redux-act-reducer';
import getMyInfoApi from './api';

const prefix = 'USER';

export const GET_MY_INFO = `${prefix}_GET_MY_INFO`;
export const SET_MAIN_MENU_COLLAPSED = `${prefix}_SET_MAIN_MENU_COLLAPSED`;

export const getMyInfo = createActionAsync(GET_MY_INFO, getMyInfoApi);
export const setMainMenuCollapsed = createAction(SET_MAIN_MENU_COLLAPSED, 'collapsed');
