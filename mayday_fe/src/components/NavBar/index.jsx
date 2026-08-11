import React from 'react';
import styles from "./NavBar.module.css";
import { Link, useLocation } from 'react-router-dom';

import homeIcon from '../../assets/images/HomeIcon.svg';
import addIcon from '../../assets/images/AddIcon.svg';
import mypageIcon from '../../assets/images/MyPageIcon.svg';

function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navContainer}>
      <Link to="/" className={styles.navItem}>
        <img src={isActive('/') ? homeIcon : homeIcon} className={styles.icon} /> {/* 액티브 아이콘 수정 필요*/}
        <span className={styles.label} style={{ color: isActive('/') ? '#101828' : '#99A1AF' }}>홈</span>
      </Link>

      <Link to="/record" className={styles.navItem}>
        <div className={styles.centerButton}>
          <img src={addIcon} className={styles.addIcon} />
        </div>
        <span className={styles.label} style={{ color: '#101828', fontWeight: 'bold' }}>등록</span>
      </Link>

      <Link to="/mypage" className={styles.navItem}>
        <img src={isActive('/mypage') ? mypageIcon : mypageIcon} className={styles.icon} />  {/* 액티브 아이콘 수정 필요*/}
        <span className={styles.label} style={{ color: isActive('/mypage') ? '#101828' : '#99A1AF' }}>마이</span>
      </Link>
    </nav>
  );
}

export default NavBar;