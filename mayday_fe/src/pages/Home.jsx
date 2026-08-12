import React from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import HomeAiIcon from "../assets/images/HomeAiIcon.svg";
import HomeArrowIcon from "../assets/images/HomeArrowIcon.svg";
import HomeDownloadIcon from "../assets/images/HomeDownloadIcon.svg";
import HomeProfileIcon from "../assets/images/HomeProfileIcon.svg";
import HomeRecordIcon from "../assets/images/HomeRecordIcon.svg";
import { HOME_MOCK_DATA } from "../api/home-mock-data";

// 내년 5월 31일까지 남은 일수 계산 함수
function getDDayString() {
  const today = new Date();
  const currentYear = today.getFullYear();

  // 오늘 자정 기준으로 시간 설정 (시/분/초 오차 방지)
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // 목표일: 다음해 5월 31일 (Month는 0부터 시작하므로 4 = 5월)
  const targetDate = new Date(currentYear + 1, 4, 31);

  const diffTime = targetDate.getTime() - startOfDay.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `D-${diffDays}`;
}

function Home() {
  const navigate = useNavigate();

  const dDay = getDDayString(); // 동적 계산된 D-Day

  // 직전년도 동적 계산 (예: 2026년 기준 -> 2025년)
  const previousYear = new Date().getFullYear() - 1;

  // home-mock-data 사용
  const {
    yearlyExpense,
    aiFoundExpense,
    recordedIncomeRatio,
    recordedExpenseRatio,
    recordedIncome,
    recordedExpense,
    aiClassifiedRecords,
  } = HOME_MOCK_DATA;

  // 내보내기 페이지 이동 함수
  const handleNavigateToExport = () => {
    navigate("/export", {
      state: {
        selectedYear: previousYear, // 직전년도 넘겨주기
      },
    });
  };

  return (
    <div>
      {/* 헤더 */}
      <header className={styles.header}>
        <b className={styles.logo}>
          <span className={styles.logoText}>메이데이</span>
          <span className={styles.dDay}>{dDay}</span>
        </b>

        <div onClick={() => navigate("/mypage")}>
          <img src={HomeProfileIcon} />
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.content}>
        {/* 올해 기록한 비용 */}
        <section className={styles.expenseSummary}>
          <div className={styles.summaryTitle}>올해 기록한 비용</div>

          <div className={styles.summaryAmount}>
            <b className={styles.expenseAmount}>{yearlyExpense}</b>
            <b className={styles.currency}>원</b>
          </div>

          <div className={styles.summaryDescription}>
            이번 달 AI가 {aiFoundExpense}원이 기록됐어요
          </div>
        </section>

        {/* 올해 수입과 비용 */}
        <section className={styles.incomeExpense}>
          <b className={styles.sectionTitle}>올해 수입과 비용</b>

          <div className={styles.ratioBar}>
            {/* recordedIncomeRatio 값에 따라 width 조절 */}
            <div
              className={styles.incomeBar}
              style={{ width: `${recordedIncomeRatio}%` }}
            >
              <span className={styles.incomeRatio}>{recordedIncomeRatio}</span>
            </div>

            <div className={styles.expenseBar}>
              <span className={styles.expenseRatio}>
                {recordedExpenseRatio}
              </span>
            </div>
          </div>

          <div className={styles.ratioLabels}>
            <span className={styles.incomeLabel}>기록한 수입</span>
            <span className={styles.expenseLabel}>기록한 비용</span>
          </div>

          <div className={styles.amountList}>
            <div className={styles.incomeAmount}>
              <b>● 기록한 수입</b>
              <b className={styles.amountValue}>{recordedIncome}원</b>
            </div>

            <div className={styles.expenseAmountRow}>
              <b>
                <span className={styles.expenseDot}>●</span>
                <span> 기록한 비용</span>
              </b>

              <b className={styles.amountValue}>{recordedExpense}원</b>
            </div>
          </div>
        </section>

        {/* 최근 기록 / AI 분류 */}
        <section className={styles.recordCards}>
          <div
            className={styles.recentRecords}
            onClick={() => navigate("/history")}
          >
            <img src={HomeArrowIcon} className={styles.aiIcon} />

            <b className={styles.cardTitle}>최근 기록 내역</b>

            <div className={styles.cardDescription}>기록 내역 바로가기</div>
          </div>

          <div className={styles.aiRecords}>
            <img src={HomeAiIcon} className={styles.aiIcon} />

            <b className={styles.aiCount}>{aiClassifiedRecords}건</b>

            <div className={styles.aiDescription}>이번 달 AI가 분류한 기록</div>
          </div>
        </section>

        {/* 경비 기록 / 내보내기 */}
        <section className={styles.actionCards}>
          <div
            className={styles.expenseRecordCard}
            onClick={() => navigate("/record")}
          >
            <img src={HomeRecordIcon} className={styles.aiIcon} />

            <b className={styles.actionTitle}>경비 기록</b>

            <div className={styles.actionDescription}>
              촬영 · 업로드로 바로 분석
            </div>
          </div>

          <div
            className={styles.exportCard}
            onClick={handleNavigateToExport}
          >
            <img src={HomeDownloadIcon} className={styles.aiIcon} />

            <b className={styles.actionTitle}>내보내기</b>

            <div className={styles.actionDescription}>
              직전 년도 기록 내보내기
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
