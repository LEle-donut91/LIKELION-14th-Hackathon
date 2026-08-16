import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import styles from "./AnalysisRecord.module.css";

import AnalysisRecordIcon from "../assets/images/AnalysisRecordIcon.svg";
import AnalysisRecordTime from "../assets/images/AnalysisRecordTime.svg";

function AnalysisRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    type = "expense",
    savedCount = 0, 
    savedAmount = 0 
  } = location.state || {};

  const isExpense = type === "expense";
  const subtitle = isExpense
    ? "AI가 정리한 내용이 올해 장부에 반영됐어요.\n기록 조회에서 언제든 수정할 수 있어요."
    : "수입 기록이 올해 장부에 반영됐어요.\n기록 조회에서 언제든 수정할 수 있어요.";
  const amountLabel = isExpense ? "저장한 비용" : "저장한 수입";
  const [accumulatedCount, setAccumulatedCount] = useState(0);
  const [dDayText, setDDayText] = useState("");

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    let targetYear = today.getFullYear();
    let targetDate = new Date(targetYear, 4, 31); 

    if (today > targetDate) {
      targetYear += 1;
      targetDate = new Date(targetYear, 4, 31);
    }
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      setDDayText("D-Day");
    } else {
      setDDayText(`D-${diffDays}`);
    }
  }, []);

  useEffect(() => {
    const fetchAccumulatedRecords = async () => {
      try {
        // [TODO] 백엔드 누적 기록 API가 완성되면 아래 주석을 풀고 연동하세요!
        /*
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/records/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.status === 200) {
          setAccumulatedCount(result.data.totalRecords);
        }
        */

        // 임시 더미 데이터 (지금 방금 저장한 건수 + 기존 159건)
        setAccumulatedCount(159 + savedCount);
      } catch (error) {
        console.error("누적 기록 조회 실패:", error);
      }
    };
    fetchAccumulatedRecords();
  }, [savedCount]);

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.iconWrapper}>
          <img src={AnalysisRecordIcon} alt="완료 아이콘" />
        </div>
        <h1 className={styles.title}>결과를 저장했어요</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>저장한 기록</span>
            <span className={styles.summaryValue}>{savedCount}건</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{amountLabel}</span>
            <span className={styles.summaryValue}>{Number(savedAmount).toLocaleString()}원</span>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>올해 누적 기록</span>
            <span className={styles.accumulatedValue}>{accumulatedCount}건</span>
          </div>
        </div>
        <div className={styles.dDayBanner}>
          <img src={AnalysisRecordTime} alt="타이머 아이콘" />
          <span>5월 종합소득세 신고까지 {dDayText}</span>
        </div>
      </main>
      <div className={styles.buttonArea}>
        <Button text="저장한 기록 보기" onClick={() => navigate('/history')} className={styles.primaryBtn} />
        <Button text="홈으로" onClick={() => navigate('/home')} style={{ backgroundColor: '#FFFFFF', color: '#3F4652', border: '1px solid #DEE1E7' }} />
      </div>
    </div>
  );
}

export default AnalysisRecord;