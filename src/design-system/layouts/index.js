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
export function StandardAdminLayout({ children }) {
  return <Shell kind="standard-admin">{children}</Shell>;
}
export function WorkspaceLayout({ children, tools }) {
  const [toolsOpen, setToolsOpen] = useState(true);
  return (
    <Shell kind="workspace">
      <div className="ds-workspace">
        <div className="min-w-0 flex-1">
          {tools && (
            <div className="ds-layout-toolbar">
              <Button variant="ghost" size="sm" onClick={() => setToolsOpen(value => !value)} aria-expanded={toolsOpen} aria-controls="workspace-tools">
                {toolsOpen ? <PanelRightClose /> : <PanelRightOpen />}工具面板
              </Button>
            </div>
          )}
          {children}
        </div>
        {tools && toolsOpen && (
          <aside id="workspace-tools" className="ds-tools-panel" aria-label="工作区工具">
            {tools}
          </aside>
        )}
      </div>
    </Shell>
  );
}
export function MonitoringLayout({ children, alerts }) {
  return (
    <Shell kind="monitoring">
      <div className="ds-monitoring">
        <div className="min-w-0 flex-1">{children}</div>
        {alerts && (
          <aside className="ds-tools-panel" aria-label="实时信息">
            {alerts}
          </aside>
        )}
      </div>
    </Shell>
  );
}
export function PageLayout(props) {
  const { layout } = useLayout();
  if (layout === 'workspace') return <WorkspaceLayout {...props} />;
  if (layout === 'monitoring') return <MonitoringLayout {...props} />;
  return <StandardAdminLayout {...props} />;
}
export { LayoutProvider } from './provider';
export { useLayout, LAYOUTS } from './context';
