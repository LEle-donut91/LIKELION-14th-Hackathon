import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Loading.module.css';

import LoadingIcon from '../assets/images/Loading.svg';

function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = 4000;
    const update = 30;
    const step = 100 / (total / update);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, update);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const navTimer = setTimeout(() => {
        navigate('/analysis-result', { state: location.state });
      }, 300);
      return () => clearTimeout(navTimer);
    }
  }, [progress, navigate, location.state]);

  let bottomText = "입력한 정보를 읽는 중...";
  if (progress >= 33 && progress < 66) {
    bottomText = "거래 내역을 분석하는 중...";
  } else if (progress >= 66) {
    bottomText = "경비 항목 · 적격 여부 판단 중...";
  }

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.container}>
      <div className={styles.progressContainer}>
        <svg className={styles.progressSvg} width="140" height="140" viewBox="0 0 140 140">
          <circle className={styles.progressTrack} cx="70" cy="70" r={radius} />
          <circle className={styles.progressFill} cx="70" cy="70" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset, }} />
        </svg>
        <div className={styles.iconWrapper}>
          <img src={LoadingIcon} className={styles.icon} />
        </div>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.text}>잠시만 기다려 주세요...</p>
        <h2 className={styles.title}>메이데이가 거래 내역을<br />분석하고 있어요</h2>
      </div>
      <p className={styles.texts}>{bottomText}</p>
    </div>
  );
}

export default Loading;