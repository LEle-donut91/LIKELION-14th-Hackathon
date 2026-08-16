import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Onboarding.module.css';

import OnboardingIcon from '../assets/images/Onboarding.svg';

function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login'); 
    }, 3000);
    return () => clearTimeout(timer); 
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <img src={OnboardingIcon} alt="mayday logo" className={styles.logo} />
        </div>
      </div>
      <div className={styles.text}>
        AI 경비 정리 · 종합소득세 준비
      </div>
    </div>
  );
}

export default Onboarding;