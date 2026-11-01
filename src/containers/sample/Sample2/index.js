import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { clearError } from './actions';
import { selectError } from './selectors';
import { MainHeader, MainMenu, PageHeader, PageContent, MainPage, PageSection } from '../../../components';
import styles from './styles.css';
import config from '../../../config';

const Article = () => {
  const dispatch = useDispatch();
  const err = useSelector(selectError);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (err) {
      toast.error(err);
      dispatch(clearError());
    }
  }, [dispatch, err]);

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
            <div className={styles.testcontent}>文章管理(这里是样例，可以删除)</div>
          </PageSection>
        </PageContent>
      </MainPage>
    </div>
  );
};

export default Article;
