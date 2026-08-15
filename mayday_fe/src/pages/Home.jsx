import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import HomeAiIcon from "../assets/images/HomeAiIcon.svg";
import HomeArrowIcon from "../assets/images/HomeArrowIcon.svg";
import HomeDownloadIcon from "../assets/images/HomeDownloadIcon.svg";
import HomeProfileIcon from "../assets/images/HomeProfileIcon.svg";
import HomeRecordIcon from "../assets/images/HomeRecordIcon.svg";
import { getHomeSummary } from "../api/homeApi";

function Home() {
  const navigate = useNavigate();

  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const currentYear = today.getFullYear(); // 현재 연도
  const currentMonth = today.getMonth() + 1; // 현재 월 (1 ~ 12월)

  const previousYear = currentYear - 1; // 직전년도

  useEffect(() => {
    const fetchHomeSummary = async () => {
      try {
        setIsLoading(true);
        // 현재 연도 및 월 전달
        const res = await getHomeSummary({
          year: currentYear,
          month: currentMonth,
        });

        if (res.status === 200 && res.data) {
          setHomeData(res.data);
        }
      } catch (error) {
        console.error("홈 요약 정보 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeSummary();
  }, [currentYear, currentMonth]);

  // 내보내기 페이지 이동 함수
  const handleNavigateToExport = () => {
    navigate("/export", {
      state: {
        selectedYear: previousYear, // 직전년도 넘겨주기
      },
    });
  };

  if (isLoading) {
    return <div className={styles.loading}>데이터를 불러오는 중입니다...</div>;
  }

  const {
    yearlyExpense = 0,
    aiFoundExpense = 0,
    recordedIncomeRatio = 0,
    recordedExpenseRatio = 0,
    recordedIncome = 0,
    recordedExpense = 0,
    aiClassifiedRecords = 0,
    taxDDay = 0,
  } = homeData || {};

  return (
    <div>
      {/* 헤더 */}
      <header className={styles.header}>
        <b className={styles.logo}>
          <span className={styles.logoText}>메이데이   </span>
          <span className={styles.dDay}>D-{taxDDay}</span>
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
            <b className={styles.expenseAmount}>{yearlyExpense.toLocaleString()}</b>
            <b className={styles.currency}>원</b>
          </div>

          <div className={styles.summaryDescription}>
            이번 달 AI가 {aiFoundExpense.toLocaleString()}원이 기록됐어요
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
              <b className={styles.amountValue}>{recordedIncome.toLocaleString()}원</b>
            </div>

            <div className={styles.expenseAmountRow}>
              <b>
                <span className={styles.expenseDot}>●</span>
                <span> 기록한 비용</span>
              </b>

              <b className={styles.amountValue}>{recordedExpense.toLocaleString()}원</b>
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
