import React from 'react';
import styles from './styles.css';

const PageSection = ({ children, paddingTop = '24px', minHeight = '280px', marginTop = '0' }) => (
  <div className={styles.section} style={{ marginTop }}>
    <div className={styles.sectionBody} style={{ paddingTop, minHeight }}>
      {children}
    </div>
  </div>
);

export default PageSection;
