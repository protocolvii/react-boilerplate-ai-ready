import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainHeader, MainMenu, MainPage, PageHeader, PageContent, PageSection, EmptyState } from '../../components';
import config from '../../config';

// 未接入业务页面时的生产首页；开发环境的默认向导独立按需加载。
const Start = () => (
  <div className="flex min-h-screen flex-col bg-muted/40">
    <Helmet title={config.app.title} />
    <MainHeader />
    <MainMenu />
    <MainPage fill>
      <PageHeader title="首页" />
      <PageContent fill>
        <PageSection fill>
          <EmptyState title="暂无内容" description="当前还没有可展示的业务内容。" />
        </PageSection>
      </PageContent>
    </MainPage>
  </div>
);

export default Start;
