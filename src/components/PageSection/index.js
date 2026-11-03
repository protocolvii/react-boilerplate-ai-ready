import React from 'react';
import styles from './styles.css';

const PageSection = ({ children, paddingTop, minHeight = '280px', marginTop = '0', fill = false }) => (
  <div className={`ds-panel ${styles.section}${fill ? ` ${styles.fill}` : ''}`} style={{ marginTop }}>
    <div className={styles.sectionBody} style={{ paddingTop, minHeight }}>
      {children}
    </div>
  </div>
);

export default PageSection;
