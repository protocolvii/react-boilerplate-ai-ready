import React from 'react';
import styles from './styles.css';

const FormBox = ({ children }) => (
  <div className="form-box">
    <div className={styles.form}>{children}</div>
  </div>
);

export default FormBox;
