import React from 'react';
import { cn } from '../../utils/cn';
const PageContent = ({ children, fill = false }) => <div className={cn('ds-page-content', fill && 'flex min-w-0 flex-1 flex-col')}>{children}</div>;
export default PageContent;
