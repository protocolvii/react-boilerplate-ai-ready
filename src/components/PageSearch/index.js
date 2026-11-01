import React from 'react';
import styles from './styles.css';

const PageSearch = ({ children }) => (
  <div className={styles.contentWrap}>
    <div className={styles.contentBody}>
      <div className="search-box">{children}</div>
    </div>
  </div>
);

export default PageSearch;
