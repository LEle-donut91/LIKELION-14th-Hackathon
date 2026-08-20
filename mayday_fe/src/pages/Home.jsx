import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import HomeAiIcon from "../assets/images/HomeAiIcon.svg";
import HomeHistoryIcon from "../assets/images/HomeHistoryIcon.svg";
import HomeExportIcon from "../assets/images/HomeExportIcon.svg";
import HomeProfileIcon from "../assets/images/HomeProfileIcon.svg";
import HomeRecordIcon from "../assets/images/HomeRecordIcon.svg";
import NavBar from "../components/NavBar";
import Scrollbar from '../components/ScrollBar';
import { getHomeSummary } from "../api/homeApi";
import HomeIcon2 from "../assets/images/HomeIcon2.svg";

function Home() {
  const navigate = useNavigate();

  // API 요청 중복 실행 방지용 플래그
  const isFetchedRef = useRef(false);

  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const currentYear = today.getFullYear(); // 현재 연도
  const currentMonth = today.getMonth() + 1; // 현재 월 (1 ~ 12월)

  const previousYear = currentYear - 1; // 직전년도

  useEffect(() => {
    // API 요청 중복 실행 방지
    if (isFetchedRef.current) return;
    isFetchedRef.current = true;

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
    <div className={styles.home}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {/* <b className={styles.logo}>
            <span className={styles.logoText}>메이데이</span>
          </b>*/}
          <img src={HomeIcon2} style={{ width: '100px', paddingBottom: '5px' }}/>
          <div className={styles.dDayBadge}>
            <span className={styles.dDay}>
              5월 신고 마감일 D-{isLoading ? "로딩중..." : taxDDay}
            </span>
          </div>
        </div>

        <div
          onClick={() => navigate("/mypage")}
          className={styles.profileButton}
        >
          <img
            src={HomeProfileIcon}
            alt="Profile"
            className={styles.profileIcon}
          />
        </div>
      </header>

      <Scrollbar>
        {/* 메인 콘텐츠 */}
        <main className={styles.content}>
          {/* 올해 기록한 비용 */}
          <section className={styles.expenseSummary}>
            <div className={styles.summaryTitle}>올해 정리한 경비</div>

            <div className={styles.summaryAmount}>
              <b className={styles.expenseAmount}>
                {isLoading ? "로딩중..." : yearlyExpense.toLocaleString()}
              </b>
              {!isLoading && <div className={styles.currency} style={{ marginLeft: '10px' }}>원</div>}
            </div>

            <div className={styles.summaryDescription}>
              <div className={styles.dotIcon} />
              <span>
                {isLoading
                  ? "로딩중..."
                  : `이번 달 AI가 ${aiFoundExpense.toLocaleString()}원을 기록했어요`}
              </span>
            </div>
          </section>

          {/* 올해 수입과 비용 */}
          <section className={styles.incomeExpense}>
            <b className={styles.sectionTitle}>올해 수입과 비용</b>

            <div className={styles.ratioBar}>
              {/* recordedIncomeRatio 값에 따라 width 조절 */}
              <div
                className={styles.incomeBar}
                style={{ width: `${isLoading ? 0 : recordedIncomeRatio}%` }}
              />
              <div
                className={styles.expenseBar}
                style={{ width: `${isLoading ? 0 : recordedExpenseRatio}%` }}
              />
            </div>

            <div className={styles.ratioLabels}>
              <span className={styles.incomeLabel}>
                수입 {isLoading ? "로딩중..." : `${recordedIncomeRatio}%`}
              </span>
              <span className={styles.expenseLabel}>
                비용 {isLoading ? "로딩중..." : `${recordedExpenseRatio}%`}
              </span>
            </div>

            <div className={styles.amountList}>
              <div className={styles.incomeAmount}>
                <div className={styles.incomeDotRow}>
                  <div className={styles.incomeDot} />
                  <span className={styles.incomeText}>기록한 수입</span>
                </div>
                <b className={styles.amountValueIncome}>
                  {isLoading
                    ? "로딩중..."
                    : `${recordedIncome.toLocaleString()}원`}
                </b>
              </div>

              <div className={styles.expenseAmountRow}>
                <div className={styles.expenseDotRow}>
                  <div className={styles.expenseDot} />
                  <span className={styles.expenseText}>기록한 비용</span>
                </div>
                <b className={styles.amountValueExpense}>
                  {isLoading
                    ? "로딩중..."
                    : `${recordedExpense.toLocaleString()}원`}
                </b>
              </div>
            </div>
          </section>

          {/* 2x2 그리드 영역 */}
          <div className={styles.gridContainer}>
            {/* 최근 기록 */}
            <div
              className={styles.recentRecords}
              onClick={() => navigate("/history")}
            >
              <img src={HomeHistoryIcon} className={styles.aiIcon} alt="" />
              <b className={styles.cardTitle}>최근 기록 내역</b>
              <div className={styles.cardDescription}>기록 내역 바로가기</div>
            </div>

            {/* AI 분류 */}
            <div className={styles.aiRecords}>
              <img src={HomeAiIcon} className={styles.aiIcon} alt="" />
              <b className={styles.aiCount}>
                {isLoading ? "로딩중..." : `${aiClassifiedRecords}건`}
              </b>
              <div className={styles.aiDescription}>이번 달 AI가 분류한 기록</div>
            </div>

            {/* 경비 기록 */}
            <div
              className={styles.expenseRecordCard}
              onClick={() => navigate("/record")}
            >
              <img src={HomeRecordIcon} className={styles.aiIcon} alt="" />
              <b className={styles.actionTitle}>경비 기록</b>
              <div className={styles.actionDescription}>
                촬영 · 업로드로 바로 분석
              </div>
            </div>

            {/* 내보내기 */}
            <div className={styles.exportCard} onClick={handleNavigateToExport}>
              <img src={HomeExportIcon} className={styles.aiIcon} alt="" />
              <b className={styles.actionTitle}>내보내기</b>
              <div className={styles.actionDescription}>
                직전 년도 기록 내보내기
              </div>
            </div>
          </div>
        </main>
      </Scrollbar>
      
      <NavBar />
    </div>
  );
}

export default Home;
