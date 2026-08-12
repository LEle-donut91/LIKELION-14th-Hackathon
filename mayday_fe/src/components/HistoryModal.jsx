import React from "react";
import styles from "./HistoryModal.module.css";

function HistoryModal({
  isOpen,
  onClose,
  title,
  onReset,
  submitText,
  onSubmit,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* 상단 드래그 핸들 */}
        <div className={styles.handleArea}>
          <div className={styles.handle} />
        </div>

        {/* 헤더 (타이틀 + 초기화 버튼) */}
        <div className={styles.header}>
          <strong className={styles.title}>{title}</strong>
          {onReset && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={onReset}
            >
              초기화
            </button>
          )}
        </div>

        {/* 바텀시트 메인 콘텐츠 */}
        <div className={styles.body}>{children}</div>

        {/* 하단 CTA 버튼 & 홈 인디케이터 */}
        {(submitText || onSubmit) && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={onSubmit || onClose}
            >
              {submitText || "적용하기"}
            </button>
          </div>
        )}

        {/* 홈 인디케이터 바 */}
        <div className={styles.homeIndicatorWrapper}>
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
