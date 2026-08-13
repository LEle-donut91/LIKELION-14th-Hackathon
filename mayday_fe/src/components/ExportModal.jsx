import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styles from "./ExportModal.module.css";
import ExportModalCancelIcon from "../assets/images/ExportModalCancelIcon.svg";
import Button from "./Button";

// null, undefined, 빈 문자열("")일 경우 '—' 반환
const formatValue = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  return val;
};

function ExportModal({
  isOpen,
  onClose,
  summary,
  headers = [],
  rows = [],
  noticeText = "",
  options = {},
}) {
  const tableScrollRef = useRef(null);
  const trackRef = useRef(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  // 테이블 영역 스크롤 시 비율 업데이트
  const handleScroll = () => {
    if (!tableScrollRef.current || isDragging) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollRatio(scrollLeft / maxScroll);
    }
  };

  // 트랙 상수
  const trackWidth = 50;
  const thumbWidth = 27;
  const maxThumbLeft = trackWidth - thumbWidth; // 23px

  // 드래그 시작 (마우스 / 터치)
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    if (tableScrollRef.current) {
      dragStartScrollLeft.current = tableScrollRef.current.scrollLeft;
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  // 트랙 클릭 시 해당 위치로 즉시 스크롤 이동
  const handleTrackClick = (e) => {
    if (!trackRef.current || !tableScrollRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    // 클릭된 x위치를 thumb 중심으로 맞춤
    const targetThumbLeft = Math.max(0, Math.min(maxThumbLeft, clickX - thumbWidth / 2));
    const ratio = targetThumbLeft / maxThumbLeft;
    
    const { scrollWidth, clientWidth } = tableScrollRef.current;
    tableScrollRef.current.scrollLeft = ratio * (scrollWidth - clientWidth);
    setScrollRatio(ratio);
  };

  // 드래그 중 이동 처리
  const handleMove = useCallback(
    (clientX) => {
      if (!isDragging || !tableScrollRef.current) return;
      const deltaX = clientX - dragStartX.current;
      
      const { scrollWidth, clientWidth } = tableScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll <= 0) return;

      // 트랙의 이동 범위 대비 테이블 이동 비율 계산
      const scrollDelta = (deltaX / maxThumbLeft) * maxScroll;
      const newScrollLeft = Math.max(0, Math.min(maxScroll, dragStartScrollLeft.current + scrollDelta));
      
      tableScrollRef.current.scrollLeft = newScrollLeft;
      setScrollRatio(newScrollLeft / maxScroll);
    },
    [isDragging, maxThumbLeft]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 전역 마우스/터치 이벤트 등록
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => handleMove(e.clientX);
    const onTouchMove = (e) => e.touches.length > 0 && handleMove(e.touches[0].clientX);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleMove, handleDragEnd]);

  if (!isOpen) return null;

  const { topRecordsCount, totalCount } = summary || {};
  const { isQualifiedGroupChecked, isEvidenceChecked, hasRemark } = options;
  const thumbLeft = scrollRatio * maxThumbLeft;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* 모달 상단 헤더 */}
        <header className={styles.header}>
          <h2 className={styles.title}>미리보기</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            <img src={ExportModalCancelIcon} />
          </button>
        </header>

        {/* 요약 정보 */}
        <div className={styles.subHeader}>
          <span className={styles.recordSummary}>
            {headers.length}개 열 · 상위 {topRecordsCount}건 · 전체 {totalCount}
            건
          </span>
          <span className={styles.scrollHint}>← 좌우로 밀어 확인 →</span>
        </div>

        {/* 테이블 영역 */}
        <section
          ref={tableScrollRef}
          onScroll={handleScroll}
          className={styles.tableScrollArea}
        >
          <table className={styles.previewTable}>
            <thead>
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className={
                      header === "수입" || header === "비용"
                        ? styles.alignRight
                        : styles.alignLeft
                    }
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className={styles.dateCol}>{row.date}</td>
                  <td>{row.account}</td>
                  <td>{row.content}</td>
                  <td>{row.client}</td>
                  <td className={styles.alignRight}>{row.income || ""}</td>
                  <td className={styles.alignRight}>{row.expense || ""}</td>

                  {isQualifiedGroupChecked && (
                    <td>
                      {row.qualified === null || row.qualified === undefined
                        ? "—"
                        : row.qualified
                        ? "적격"
                        : "부적격"}
                    </td>
                  )}
                  {isEvidenceChecked && <td>{formatValue(row.evidence)}</td>}
                  {isQualifiedGroupChecked && hasRemark && (
                    <td>{formatValue(row.remark)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 작동 가능한 커스텀 스크롤바 트랙 및 바 */}
        <div
          ref={trackRef}
          className={styles.scrollIndicatorTrack}
          onClick={handleTrackClick}
        >
          <div
            className={styles.scrollIndicatorThumb}
            style={{ transform: `translateX(${thumbLeft}px)` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </div>

        {/* 하단 안내 및 확인 버튼 */}
        <p className={styles.noticeText}>{noticeText}</p>
        <Button text="확인" onClick={onClose} />
      </div>
    </div>,
    document.body,
  );
}

export default ExportModal;
