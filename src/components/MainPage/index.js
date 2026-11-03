import React from 'react';
import { useSelector } from 'react-redux';
import { cn } from '../../utils/cn';
import { selectCollapsed } from '../../containers/User/selectors';
const MainPage = ({ children, fill = false }) => {
  const collapsed = useSelector(selectCollapsed);
  return (
    <main data-sidebar-collapsed={!!collapsed} className={cn('ds-main-page min-w-0 flex-1 pt-[var(--header-height)]', fill && 'flex flex-col')}>
      {children}
    </main>
  );
};
export default MainPage;
