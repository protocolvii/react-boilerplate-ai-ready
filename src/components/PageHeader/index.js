import React from 'react';
import Breadcrumb from '../Breadcrumb';
import styles from './styles.css';

const PageHeader = ({ breadcrumb, title, info, children, paddingBottom, actions }) => (
  <div className={styles.contentTop} style={{ paddingBottom }}>
    <Breadcrumb data={breadcrumb} />
    {children && children}
    {!children && (
      <div className={styles.headingRow}>
        <div>
          {title && <h1 className={styles.title}>{title}</h1>}
          {info && <p className={styles.info}>{info}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    )}
  </div>
);

export default PageHeader;
