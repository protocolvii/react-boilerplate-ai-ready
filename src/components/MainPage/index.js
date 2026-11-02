import React from 'react';
import { useSelector } from 'react-redux';
import { selectCollapsed } from '../../containers/User/selectors';
const MainPage = ({ children }) => {
  const collapsed = useSelector(selectCollapsed);
  return (
    <main data-sidebar-collapsed={!!collapsed} className="ds-main-page min-w-0 flex-1 pt-[var(--header-height)]">
      {children}
    </main>
  );
};
export default MainPage;
