import React from "react";
import Header from "../components/Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import MyPageModal from "../components/MyPageModal";
import MyPageDeleteIcon from "../assets/images/MyPageDeleteIcon.svg";
import MyPageDownloadIcon from "../assets/images/MyPageDownloadIcon.svg";
import MyPageFolderIcon from "../assets/images/MyPageFolderIcon.svg";
import MyPageProfileIcon from "../assets/images/MyPageProfileIcon.svg";
import { MY_PAGE_MOCK_DATA } from "../api/mypage-mock-data";

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

function Mypage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dDay = getDDayString(); // 동적 계산된 D-Day
  
  // mypage-mock-data.js에서 불러오기
  const {
    email,
    recordedCount,
    qualifiedEvidenceCount,
    recognizedExpense,
  } = MY_PAGE_MOCK_DATA;

  // 1. 내보내기 클릭 핸들러
  const handleExportClick = () => {
    const count = Number(recordedCount);
    if (!count || count <= 0) {
      alert("내보낼 기록이 없습니다.");
      return;
    }
    navigate("/export");
  };

  // 2. 로그아웃 클릭 핸들러
  const handleLogout = () => {
    const isConfirmed = window.confirm("로그아웃하시겠습니까?");
    if (isConfirmed) {
      // TODO: 토큰 삭제 등 로그아웃 처리 로직 작성
      alert("로그아웃되었습니다.");
      navigate("/login"); // 로그인 페이지로 이동
    }
  };

  return (
    <div className={styles.myPage}>
      {/* 헤더 */}
      <header className={styles.header}>
        <b className={styles.headerTitle}>마이페이지</b>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 프로필 카드 */}
        <section className={styles.profileCard}>
          <img src={MyPageProfileIcon} />
          <div className={styles.profileInfo}>
            <strong className={styles.userEmail}>{email}</strong>
            <p className={styles.dDayNotice}>
              5월 종합소득세 신고 마감까지 {dDay}
            </p>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className={styles.statsCard}>
          <div className={styles.statGroup}>
            <strong className={styles.statNum}>{recordedCount}건</strong>
            <span className={styles.statLabel}>올해 기록</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statGroup}>
            <strong className={styles.statNum}>
              {qualifiedEvidenceCount}건
            </strong>
            <span className={styles.statLabel}>적격 증빙</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statGroup}>
            <strong className={styles.statNum}>{recognizedExpense}만 원</strong>
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
              <img src={MyPageFolderIcon} />
              <div className={styles.menuTextBox}>
                <strong className={styles.menuTitle}>기록 조회</strong>
                <span className={styles.menuSubTitle}>
                  연도별 장부 · 검색 · 필터
                </span>
              </div>
              <div className={styles.arrowIcon} />
            </button>

            <button className={styles.menuItem} onClick={handleExportClick}>
              <img src={MyPageDownloadIcon} />
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
              <img src={MyPageDeleteIcon} />
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

      {/* 모달 상태에 따른 조건부 렌더링 */}
      <MyPageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Mypage;
