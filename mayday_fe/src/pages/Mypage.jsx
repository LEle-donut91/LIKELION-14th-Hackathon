import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import MyPageModal from "../components/MyPageModal";
import MyPageDeleteIcon from "../assets/images/MyPageDeleteIcon.svg";
import MyPageDownloadIcon from "../assets/images/MyPageDownloadIcon.svg";
import MyPageFolderIcon from "../assets/images/MyPageFolderIcon.svg";
import MyPageProfileIcon from "../assets/images/MyPageProfileIcon.svg";
import NavBar from "../components/NavBar";
import { getMyPageSummary, postLogout } from "../api/myPageApi";
import Header from "../components/Header";

function Mypage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API 요청 중복 실행 방지용 플래그
  const isFetchedRef = useRef(false);

  // API 응답 데이터를 담을 state
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // 마이페이지 요약 데이터 GET 요청 (API 연동)
  useEffect(() => {
    // API 요청 중복 실행 방지
    if (isFetchedRef.current) return;
    isFetchedRef.current = true;

    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await getMyPageSummary(currentYear);
        setSummaryData(data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("인증이 필요합니다. 다시 로그인해주세요.");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [currentYear, navigate]);

  // 로그아웃 POST 요청 (API 연동)
  const handleLogout = async () => {
    const isConfirmed = window.confirm("로그아웃하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await postLogout(); // 백엔드에 로그아웃 요청 전송

      // 로컬 스토리지에서 인증 정보 삭제
      localStorage.removeItem("accessToken");
      alert("로그아웃되었습니다.");

      // 로그인 페이지로 이동
      navigate("/login");
      
    } catch (error) {
      console.warn("서버 로그아웃 처리 중 에러 발생:", error);
    }
  };

  // 내보내기 클릭 핸들러
  const handleExportClick = () => {
    navigate("/export", {
      state: {
        selectedYear: previousYear, // 직전년도 넘겨주기
      },
    });
  };

  return (
    <div className={styles.myPage}>
      {/* 헤더 */}
      <header className={styles.headerContainer}>
        <p className={styles.text}>마이페이지</p>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 프로필 카드 */}
        <section className={styles.profileCard}>
          <img
            src={MyPageProfileIcon}
            className={styles.profileAvatar}
            alt=""
          />
          <div className={styles.profileInfo}>
            <strong className={styles.userEmail}>
              {isLoading ? "로딩중..." : summaryData?.email}
            </strong>
            <p className={styles.dDayNotice}>
              5월 종합소득세 신고 마감까지 D-
              {isLoading ? "..." : summaryData?.taxDDay}
            </p>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className={styles.statsCard}>
          <div className={styles.statGroup}>
            <strong className={styles.statNum}>
              {isLoading ? "로딩중..." : `${summaryData?.recordedCount}건`}
            </strong>
            <span className={styles.statLabel}>올해 기록</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statGroup}>
            <strong className={styles.statNum}>
              {isLoading
                ? "로딩중..."
                : `${summaryData?.qualifiedEvidenceCount}건`}
            </strong>
            <span className={styles.statLabel}>적격 증빙</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statGroup}>
            <strong className={styles.statNum}>
              {isLoading
                ? "로딩중..."
                : `${summaryData?.recognizedExpenseTenThousand?.toLocaleString()}만 원`}
            </strong>
            <span className={styles.statLabel}>인정 경비</span>
          </div>
        </section>

        {/* 기록 관리 섹션 */}
        <section className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>기록 관리</h2>
          <div className={styles.menuCard}>
            <button
              className={styles.menuItem}
              onClick={() => navigate("/history")}
            >
              <img src={MyPageFolderIcon} className={styles.menuIcon} alt="" />
              <div className={styles.menuTextBox}>
                <strong className={styles.menuTitle}>기록 조회</strong>
                <span className={styles.menuSubTitle}>
                  연도별 장부 · 검색 · 필터
                </span>
              </div>
              <div className={styles.arrowIcon} />
            </button>

            <button className={styles.menuItem} onClick={handleExportClick}>
              <img
                src={MyPageDownloadIcon}
                className={styles.menuIcon}
                alt=""
              />
              <div className={styles.menuTextBox}>
                <strong className={styles.menuTitle}>내보내기</strong>
                <span className={styles.menuSubTitle}>
                  미리보기 · CSV · 엑셀
                </span>
              </div>
              <div className={styles.arrowIcon} />
            </button>
          </div>
        </section>

        {/* 계정 섹션 */}
        <section className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>계정</h2>
          <div className={styles.menuCard}>
            {/* 회원 탈퇴 버튼 클릭 시 모달 열기 */}
            <button
              className={styles.menuItem}
              onClick={() => setIsModalOpen(true)}
            >
              <img src={MyPageDeleteIcon} className={styles.menuIcon} alt="" />
              <div className={styles.menuTextBox}>
                <strong className={styles.menuTitle}>회원 탈퇴</strong>
                <span className={styles.menuSubTitle}>
                  저장했던 기록이 모두 삭제돼요
                </span>
              </div>
              <div className={styles.arrowIcon} />
            </button>
          </div>
        </section>

        {/* 로그아웃 */}
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </main>
      <NavBar />

      {/* 모달 상태에 따른 조건부 렌더링 */}
      <MyPageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Mypage;
