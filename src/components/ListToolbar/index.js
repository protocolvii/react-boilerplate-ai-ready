import React from 'react';
import styles from './styles.css';

const ListToolbar = ({ title, children }) => (
  <div className={styles.box}>
    <div className={styles.left}>{title}</div>
    <div className={styles.right}>{children}</div>
  </div>
);

export default ListToolbar;
