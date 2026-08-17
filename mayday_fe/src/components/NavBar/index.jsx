import React from 'react';
import styles from "./NavBar.module.css";
import { Link, useLocation } from 'react-router-dom';

import homeIcon from '../../assets/images/HomeIcon.svg';
import homeActionIcon from '../../assets/images/HomeActionIcon.svg';
import addIcon from '../../assets/images/AddIcon.svg';
import mypageIcon from '../../assets/images/MyPageIcon.svg';
import mypageActionIcon from '../../assets/images/MyPageActionIcon.svg';

function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navContainer}>
      <Link to="/home" className={styles.navItem}>
        <img src={isActive('/home') ? homeActionIcon : homeIcon} className={styles.icon} />
        <span className={styles.label} style={{ color: isActive('/home') ? '#3559C7' : '#8B919C' }}>홈</span>
      </Link>

      <Link to="/record" className={styles.navItem}>
        <div className={styles.centerButton}>
          <img src={addIcon} className={styles.addIcon} />
        </div>
        <span className={styles.label} style={{ color: '#111111' }}>등록</span>
      </Link>

      <Link to="/mypage" className={styles.navItem}>
        <img src={isActive('/mypage') ? mypageActionIcon : mypageIcon} className={styles.icon} />
        <span className={styles.label} style={{ color: isActive('/mypage') ? '#3559C7' : '#8B919C' }}>마이</span>
      </Link>
    </nav>
  );
}

export default NavBar;