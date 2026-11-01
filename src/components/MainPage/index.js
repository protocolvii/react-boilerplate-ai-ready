import React from 'react';
import { useSelector } from 'react-redux';
import { selectCollapsed } from '../../containers/User/selectors';
const MainPage = ({ children }) => {
  const collapsed = useSelector(selectCollapsed);
  return <main className={`min-w-0 flex-1 pt-14 ${collapsed ? 'md:ml-20' : 'md:ml-52'}`}>{children}</main>;
};
export default MainPage;
