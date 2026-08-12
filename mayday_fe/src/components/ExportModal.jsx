import React from "react";
import ReactDOM from "react-dom";
import styles from "./ExportModal.module.css";
import ExportModalCancelIcon from "../assets/images/ExportModalCancelIcon.svg";

function ExportModal({
  isOpen,
  onClose,
  summary,
  headers = [],
  rows = [],
  noticeText = "",
  options = {},
}) {
  if (!isOpen) return null;

  const { topRecordsCount, totalCount } = summary || {};
  const { isQualifiedGroupChecked, isEvidenceChecked, hasRemark } = options;

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
        <section className={styles.tableScrollArea}>
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
                    <td>{row.qualified ? "적격" : "부적격"}</td>
                  )}
                  {isEvidenceChecked && <td>{row.evidence}</td>}
                  {isQualifiedGroupChecked && hasRemark && (
                    <td>{row.remark || ""}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 하단 안내 및 확인 버튼 */}
        <p className={styles.noticeText}>{noticeText}</p>

        <button type="button" className={styles.confirmBtn} onClick={onClose}>
          확인
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default ExportModal;
