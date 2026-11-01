import React, { useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import MainHeader from '../../components/MainHeader';
import MainMenu from '../../components/MainMenu';
import MainPage from '../../components/MainPage';
import { Button } from '../../components/ui/button';
import { useLayout } from './context';

const Shell = ({ children, kind }) => (
  <div className="min-h-screen bg-background" data-page-layout={kind}>
    <MainHeader />
    <MainMenu />
    <MainPage>{children}</MainPage>
  </div>
);
function AdaptiveLayout({ kind, children, tools, alerts }) {
  const [toolsOpen, setToolsOpen] = useState(true);
  const showTools = kind === 'workspace' && tools;
  const aside = kind === 'monitoring' ? alerts : showTools && toolsOpen ? tools : null;
  return (
    <Shell kind={kind}>
      <div className={kind === 'standard-admin' ? 'min-w-0' : kind === 'workspace' ? 'ds-workspace' : 'ds-monitoring'}>
        <div className="min-w-0 flex-1">
          {showTools && (
            <div className="ds-layout-toolbar">
              <Button variant="ghost" size="sm" onClick={() => setToolsOpen(value => !value)} aria-expanded={toolsOpen} aria-controls="layout-tools">
                {toolsOpen ? <PanelRightClose /> : <PanelRightOpen />}工具面板
              </Button>
            </div>
          )}
          {children}
        </div>
        {aside && (
          <aside id="layout-tools" className="ds-tools-panel" aria-label={kind === 'monitoring' ? '实时信息' : '工作区工具'}>
            {aside}
          </aside>
        )}
      </div>
    </Shell>
  );
}
export function StandardAdminLayout(props) {
  return <AdaptiveLayout kind="standard-admin" {...props} />;
}
export function WorkspaceLayout(props) {
  return <AdaptiveLayout kind="workspace" {...props} />;
}
export function MonitoringLayout(props) {
  return <AdaptiveLayout kind="monitoring" {...props} />;
}
export function PageLayout(props) {
  const { layout } = useLayout();
  return <AdaptiveLayout kind={layout} {...props} />;
}
export { LayoutProvider } from './provider';
export { useLayout, LAYOUTS } from './context';
