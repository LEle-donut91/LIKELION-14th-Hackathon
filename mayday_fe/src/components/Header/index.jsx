import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Header.module.css";

import headerIcon from '../../assets/images/HeaderIcon.svg';

function Header({ text, onClick }) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={styles.headerContainer}>
      <button type="button" className={styles.backButton} onClick={handleBack}>
        <img src={headerIcon} className={styles.headerIcon} />
      </button>
      <p className={styles.text}>{text}</p>
    </header>
  );
}

export default Header;