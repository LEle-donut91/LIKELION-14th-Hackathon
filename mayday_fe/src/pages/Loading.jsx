import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Loading.module.css';

import LoadingIcon from '../assets/images/Loading.svg';

function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = location.state?.itemCount || 1; 

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/analysis-result');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <img src={LoadingIcon} className={styles.icon} />
      </div>
      
      <h2 className={styles.title}>제가 정리할게요!</h2>
      <p className={styles.subtitle}>
        영수증 {itemCount}건을 분석하고 있어요...<br />
        거래 내역을 분석하고 있어요...<br />
        5월 종합소득세 신고 잊지 마세요...
      </p>
    </div>
  );
}

export default Loading;