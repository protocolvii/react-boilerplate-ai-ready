import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { clearError } from './actions';
import { selectError } from './selectors';
import { MainHeader, MainMenu, PageHeader, PageContent, MainPage, PageSection } from '../../components';
import styles from './styles.css';
import config from '../../config';

const Home = () => {
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
    { name: '控制台', link: '' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Helmet title={config.app.title} />
      <MainHeader />
      <MainMenu defaultSelectedKeys={['home']} defaultOpenKeys={['home']} />
      <MainPage>
        <PageHeader breadcrumb={breadcrumb} title="控制台" info="这里是介绍" />
        <PageContent>
          <PageSection>
            <div className={styles.content}>内容</div>
          </PageSection>
        </PageContent>
      </MainPage>
    </div>
  );
};

export default Home;
