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

  // 커스텀 스크롤바 바(Thumb) 드래그 상태
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const thumbStartX = useRef(0);
  const thumbStartScrollLeft = useRef(0);

  // 테이블 영역 마우스 드래그 스크롤 상태
  const [isTableDragging, setIsTableDragging] = useState(false);
  const tableStartX = useRef(0);
  const tableStartScrollLeft = useRef(0);

  // 2번 디자인 상수
  const trackWidth = 50;
  const thumbWidth = 27;
  const maxThumbLeft = trackWidth - thumbWidth; // 23px

  // 모달이 다시 열릴 때 스크롤 위치 및 스크롤바 초기화
  useEffect(() => {
      if (isOpen) {
        setScrollRatio(0);
        setIsThumbDragging(false);
        setIsTableDragging(false);
        if (tableScrollRef.current) {
          tableScrollRef.current.scrollLeft = 0;
        }
      }
    }, [isOpen]);

  // 테이블 스크롤 시 커스텀 바 위치 동기화
  const handleScroll = () => {
    if (!tableScrollRef.current || isThumbDragging) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollRatio(scrollLeft / maxScroll);
    }
  };

  /* 테이블 영역 마우스 드래그 스크롤 이벤트 */
  const handleTableMouseDown = (e) => {
    // 텍스트 선택 등 기본 동작 방지 및 드래그 시작
    if (!tableScrollRef.current) return;
    setIsTableDragging(true);
    tableStartX.current = e.clientX;
    tableStartScrollLeft.current = tableScrollRef.current.scrollLeft;
  };

  const handleTableMouseMove = useCallback(
    (e) => {
      if (!isTableDragging || !tableScrollRef.current) return;
      e.preventDefault();
      const deltaX = e.clientX - tableStartX.current;
      tableScrollRef.current.scrollLeft = tableStartScrollLeft.current - deltaX;
    },
    [isTableDragging]
  );

  const handleTableMouseUp = useCallback(() => {
    setIsTableDragging(false);
  }, []);

  /* 커스텀 스크롤바(Thumb) 드래그 & 클릭 이벤트 */
  const handleThumbDragStart = (clientX) => {
    setIsThumbDragging(true);
    thumbStartX.current = clientX;
    if (tableScrollRef.current) {
      thumbStartScrollLeft.current = tableScrollRef.current.scrollLeft;
    }
  };

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation(); // 트랙 클릭 이벤트 방지
    handleThumbDragStart(e.clientX);
  };

  const handleThumbTouchStart = (e) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      handleThumbDragStart(e.touches[0].clientX);
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

  const handleThumbMove = useCallback(
    (clientX) => {
      if (!isThumbDragging || !tableScrollRef.current) return;
      const deltaX = clientX - thumbStartX.current;

      const { scrollWidth, clientWidth } = tableScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll <= 0) return;

      // 트랙의 이동 범위 대비 테이블 이동 비율 계산
      const scrollDelta = (deltaX / maxThumbLeft) * maxScroll;
      const newScrollLeft = Math.max(
        0,
        Math.min(maxScroll, thumbStartScrollLeft.current + scrollDelta)
      );

      tableScrollRef.current.scrollLeft = newScrollLeft;
      setScrollRatio(newScrollLeft / maxScroll);
    },
    [isThumbDragging, maxThumbLeft]
  );

  const handleThumbDragEnd = useCallback(() => {
    setIsThumbDragging(false);
  }, []);

  // 전역 마우스/터치 이벤트 등록
  useEffect(() => {
    // 스크롤바 바(Thumb) 드래그 중 처리
    if (isThumbDragging) {
      const onMouseMove = (e) => handleThumbMove(e.clientX);
      const onTouchMove = (e) =>
        e.touches.length > 0 && handleThumbMove(e.touches[0].clientX);

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", handleThumbDragEnd);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", handleThumbDragEnd);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", handleThumbDragEnd);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", handleThumbDragEnd);
      };
    }
  }, [isThumbDragging, handleThumbMove, handleThumbDragEnd]);

  useEffect(() => {
    // 테이블 마우스 드래그 중 처리
    if (isTableDragging) {
      window.addEventListener("mousemove", handleTableMouseMove);
      window.addEventListener("mouseup", handleTableMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleTableMouseMove);
        window.removeEventListener("mouseup", handleTableMouseUp);
      };
    }
  }, [isTableDragging, handleTableMouseMove, handleTableMouseUp]);

  if (!isOpen) return null;

  const { topRecordsCount, totalCount } = summary || {};
  const { isQualifiedGroupChecked, isEvidenceChecked, hasRemark } = options;
  const thumbLeft = scrollRatio * maxThumbLeft;

  // 헤더 텍스트 판별 및 클래스/태그 처리 함수
  const isTargetHeader = (header) =>
    header === "적격 여부" || header === "증빙 유형" || header === "비고";

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

        {/* 테이블 영역 (마우스 드래그 스크롤 지원) */}
        <section
          ref={tableScrollRef}
          onScroll={handleScroll}
          onMouseDown={handleTableMouseDown}
          className={`${styles.tableScrollArea} ${
            isTableDragging ? styles.dragging : ""
          }`}
        >
          <table className={styles.previewTable}>
            <thead>
              <tr>
                {headers.map((header, idx) => {
                  const isHighlight = isTargetHeader(header);
                  const alignClass =
                    header === "수입" || header === "비용"
                      ? styles.alignRight
                      : styles.alignLeft;
                  const bgClass = isHighlight ? styles.highlightHeader : "";

                  return (
                    <th
                      key={idx}
                      className={`${alignClass} ${bgClass}`}
                    >
                      {isHighlight ? (
                        <b style={{ color: "#111" }}>{header}</b>
                      ) : (
                        header
                      )}
                    </th>
                  );
                })}
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
                    <td className={styles.highlightCell}>
                      {row.qualified === null || row.qualified === undefined
                        ? "—"
                        : row.qualified
                        ? "적격"
                        : "부적격"}
                    </td>
                  )}
                  {isEvidenceChecked && (
                    <td className={styles.highlightCell}>
                      {formatValue(row.evidence)}
                    </td>
                  )}
                  {isQualifiedGroupChecked && hasRemark && (
                    <td className={styles.highlightCell}>
                      {formatValue(row.remark)}
                    </td>
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
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbTouchStart}
          />
        </div>

        {/* 하단 안내 및 확인 버튼 */}
        <p className={styles.noticeText}>{noticeText}</p>
        <div className={styles.buttonWrapper}>
          <Button text="확인" onClick={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ExportModal;
