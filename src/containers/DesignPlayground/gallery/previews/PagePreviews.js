import React from 'react';
import DataManagement from '../../DataManagement';
import ListPage from '../../ListPage';
import Monitoring from '../../Monitoring';
import Workspace from '../../Workspace';
import { useLayout } from '../../../../design-system/layouts';

export function DataManagementPreview() {
  return <DataManagement />;
}
export function MonitoringPreview() {
  const { layout } = useLayout();
  return <Monitoring showFeed={layout !== 'monitoring'} />;
}
export function WorkspacePreview() {
  const { layout } = useLayout();
  return <Workspace showResources={layout !== 'workspace'} />;
}

export function ListPagePreview() {
  return <ListPage />;
}
