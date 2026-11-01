import React from 'react';
import { useSelector } from 'react-redux';
import { selectCollapsed } from '../../containers/User/selectors';
const MainPage = ({ children }) => {
  const collapsed = useSelector(selectCollapsed);
  return <main className={`min-w-0 flex-1 pt-[var(--header-height)] ${collapsed ? 'md:ml-[var(--sidebar-collapsed-width)]' : 'md:ml-[var(--sidebar-width)]'}`}>{children}</main>;
};
export default MainPage;
