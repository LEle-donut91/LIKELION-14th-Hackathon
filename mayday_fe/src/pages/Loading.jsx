import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Loading.module.css';

import LoadingIcon from '../assets/images/Loading.svg';
import axiosInstance from '../api/axiosInstance';

function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, tab } = location.state || {};
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const performAnalysis = async () => {
      if (!items || items.length === 0) {
        navigate('/record');
        return;
      }
      const rawAnalyzedData = [];
      const total = items.length;
      for (let i = 0; i < total; i++) {
        const item = items[i];
        try {
          const endpoint = '/expenses/analyze';
          const payload = {
            sourceType: item.type === 'image' ? 'OCR' : 'TEXT',
            sourceId: item.sourceId,
            rawText: item.rawText,
            withholdingTaxApplied: item.withholding
          };
          const res = await axiosInstance.post(endpoint, payload);
          if (res.status === 200 || res.status === 201) {
            const responseData = res.data?.data || res.data;
            rawAnalyzedData.push({
              ...responseData,
              isWithholding: item.withholding
            });
          }
        } catch (error) {
          console.error("AI 분석 실패:", error);
        }
        if (!isCancelled) {
           setProgress(Math.round(((i + 1) / total) * 100));
        }
      }
      if (isCancelled) return;
      if (rawAnalyzedData.length === 0) {
        alert("데이터 분석에 실패했습니다. 다시 시도해주세요.");
        navigate('/record');
        return;
      }
      setTimeout(() => {
         if (tab === 'expense') {
           navigate('/analysis-result-ex', { state: { rawAnalyzedData } });
         } else {
           navigate('/analysis-result-in', { state: { rawAnalyzedData } });
         }
      }, 400);
    };
    performAnalysis();
    return () => { isCancelled = true; };
  }, [items, tab, navigate]);

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