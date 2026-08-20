import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import Scrollbar from '../components/ScrollBar';
import styles from "./AnalysisRecord.module.css";

import AnalysisRecordIcon from "../assets/images/AnalysisRecordIcon.svg";
import AnalysisRecordTime from "../assets/images/AnalysisRecordTime.svg";

import { getMyPageSummary } from '../api/myPageApi';

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

  const finalSavedAmount = savedCount > 0 ? savedAmount : 0;
  const [accumulatedCount, setAccumulatedCount] = useState(0);
  const [dDayText, setDDayText] = useState("");
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  useEffect(() => {
    const fetchHomeSummary = async () => {
      setIsLoadingCount(true);
      try {
        const currentYear = new Date().getFullYear();
        const summaryData = await getMyPageSummary(currentYear);
        if (summaryData.taxDDay === 0) {
          setDDayText("D-Day");
        } else {
          setDDayText(`D-${summaryData.taxDDay}`);
        }
        const currentTotal = summaryData.recordedCount || 0; 
        setAccumulatedCount(currentTotal);
      } catch (error) {
        console.error("요약 정보 조회 실패:", error);
        setDDayText("D-Day 계산 불가");
        setAccumulatedCount(savedCount);
      } finally {
        setIsLoadingCount(false);
      }
    };
    fetchHomeSummary();
  }, [savedCount]);

  return (
    <div className={styles.container}>
      <Scrollbar>
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
              <span className={styles.summaryValue}>{Number(finalSavedAmount).toLocaleString()}원</span>
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
      </Scrollbar>
      <div className={styles.buttonArea}>
        <Button text="저장한 기록 보기" onClick={() => navigate('/history')} className={styles.primaryBtn} />
        <Button text="홈으로" onClick={() => navigate('/home')} style={{ backgroundColor: '#FFFFFF', color: '#3F4652', border: '1px solid #DEE1E7' }} />
      </div>
    </div>
  );
}

export default AnalysisRecord;