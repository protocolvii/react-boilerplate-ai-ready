import React from 'react';
import Breadcrumb from '../Breadcrumb';
import styles from './styles.css';

const PageHeader = ({ breadcrumb, title, info, children, paddingBottom = '16px' }) => (
  <div className={styles.contentTop} style={{ paddingBottom }}>
    <Breadcrumb data={breadcrumb} />
    {children && children}
    {!children && title && <div className={styles.title}>{title}</div>}
    {!children && info && <div className={styles.info}>{info}</div>}
  </div>
);

export default PageHeader;
