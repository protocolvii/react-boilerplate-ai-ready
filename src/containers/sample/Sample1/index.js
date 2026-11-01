import React from 'react';
import { Helmet } from 'react-helmet-async';

import { MainHeader, MainMenu, PageHeader, PageContent, MainPage, PageSection } from '../../../components';
import config from '../../../config';

const Article = () => {
  const breadcrumb = [
    { name: '首页', link: '/' },
    { name: '文章管理', link: '' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Helmet title={`文章管理 - ${config.app.title}`} />
      <MainHeader />
      <MainMenu defaultSelectedKeys={['article']} defaultOpenKeys={['article']} />
      <MainPage>
        <PageHeader breadcrumb={breadcrumb} title="文章管理" info="" />
        <PageContent>
          <PageSection>
            <div>文章管理</div>
          </PageSection>
        </PageContent>
      </MainPage>
    </div>
  );
};

export default Article;
