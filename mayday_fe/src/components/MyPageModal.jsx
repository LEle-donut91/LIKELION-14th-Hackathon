import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import styles from "./MyPageModal.module.css";
import MyPageModalIcon from "../assets/images/MyPageModalIcon.svg";
import MyPageCheckedIcon from "../assets/images/MyPageCheckedIcon.svg"
import HistoryUnCheckedIcon from "../assets/images/HistoryUnCheckedIcon.svg"
import Button from "./Button"; // Button 공통 컴포넌트 import
import { deleteUser } from "../api/myPageApi";

function MyPageModal({ isOpen, onClose, onWithdraw }) {
  const [isChecked, setIsChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // 로딩 상태
  const navigate = useNavigate();

  // 모달이 열릴 때(isOpen이 true가 될 때)마다 체크박스 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  // 탈퇴하기 클릭 핸들러
  const handleWithdraw = async () => {
    if (!isChecked || isDeleting) return;

    try {
      setIsDeleting(true);

      // 백엔드로 탈퇴 요청 (DELETE /users/me)
      const res = await deleteUser();

      alert(res?.message || "회원 탈퇴가 완료되었습니다.");

      // 프론트 인증 정보 삭제
      localStorage.removeItem("accessToken");

      if (onWithdraw) {
        onWithdraw();
      }

      onClose();
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "회원 탈퇴 처리 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      {/* e.stopPropagation()으로 모달 카드 클릭 시 닫히는 현상 방지 */}
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* 경고 아이콘 */}
        <img src={MyPageModalIcon} />

        {/* 메인 안내 문구 */}
        <div className={styles.titleSection}>
          <h3 className={styles.modalTitle}>정말 탈퇴하시겠어요?</h3>
          <p className={styles.modalDescription}>
            탈퇴하면{" "}
            <b className={styles.highlight}>
              계정의 개인정보와 모든 기록 정보
            </b>
            (지출·수입 기록, 영수증 증빙, 온보딩 설정)가{" "}
            <b className={styles.highlight}>
              즉시 삭제되며 복구할 수 없어요.
            </b>
          </p>
        </div>

        {/* 내보내기 안내 상자 */}
        <div className={styles.noticeBox}>
          <p className={styles.noticeText}>
            신고에 필요한 기록이 있다면 탈퇴 전에{" "}
            <strong className={styles.noticeHighlight}>내보내기</strong>로
            파일을 먼저 보관해 주세요.
          </p>
        </div>

        {/* 시맨틱 input 체크박스 영역 */}
        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            className={styles.hiddenCheckbox}
            checked={isChecked}
            onChange={handleCheckboxChange}
            disabled={isDeleting}
          />
          {isChecked ? <img src={MyPageCheckedIcon} /> : <img src={HistoryUnCheckedIcon} />}
          <span className={styles.checkboxLabel}>
            삭제되는 내용을 확인했어요
          </span>
        </label>

        {/* 액션 버튼 */}
        <div className={styles.buttonGroup}>
          {/* 1 & 2. 탈퇴하기 버튼 (비활성화 / 활성화) */}
          <div className={styles.submitButtonWrapper}>
            <Button
              text="탈퇴하기"
              disabled={!isChecked || isDeleting}
              onClick={handleWithdraw}
            />
          </div>

          {/* 3. 돌아가기 버튼 (Button 컴포넌트 사용 X) */}
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isDeleting}
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default MyPageModal;
