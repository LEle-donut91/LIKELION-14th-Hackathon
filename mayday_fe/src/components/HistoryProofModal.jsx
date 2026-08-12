/* 증빙 유형 필터링하는 모달 (바텀 시트) */
import React, { useState, useEffect, useMemo } from "react";
import HistoryModal from "./HistoryModal";
import styles from "./HistoryModal.module.css";
import HistoryChecked from "./HistoryChecked";
import HistoryUnChecked from "./HistoryUnChecked";

const EVIDENCE_OPTIONS = [
  "신용카드 매출전표",
  "현금영수증",
  "세금계산서",
  "계산서",
];

function HistoryProofModal({
  isOpen,
  onClose,
  value = [],
  onApply,
  records = [],
}) {
  const [tempSelected, setTempSelected] = useState(value);

  useEffect(() => {
    if (isOpen) setTempSelected(value);
  }, [isOpen, value]);

  const toggleOption = (label) => {
    setTempSelected((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  // 내부에서 각 유형별 건수를 직접 계산
  const optionCounts = useMemo(() => {
    const map = {};
    EVIDENCE_OPTIONS.forEach((type) => {
      map[type] = records.filter((r) => r.evidenceType === type).length;
    });
    return map;
  }, [records]);

  // 선택된 항목들의 총 건수
  const tempCount = useMemo(() => {
    return records.filter((i) => tempSelected.includes(i.evidenceType)).length;
  }, [records, tempSelected]);

  return (
    <HistoryModal
      isOpen={isOpen}
      onClose={onClose}
      title="증빙 유형"
      onReset={() => setTempSelected([])}
      submitText={`${tempCount}건 보기`}
      onSubmit={() => onApply(tempSelected)}
    >
      <p className={styles.subTitle}>여러 개를 선택할 수 있어요</p>
      <div className={styles.optionsList}>
        {EVIDENCE_OPTIONS.map((label) => {
          const isSelected = tempSelected.includes(label);
          return (
            <button
              key={label}
              type="button"
              className={styles.optionRow}
              onClick={() => toggleOption(label)}
            >
              <div className={styles.leftGroup}>
                {/* isChecked 값에 따라 분리된 컴포넌트 출력 */}
                {isSelected ? (
                  <HistoryChecked type="square" />
                ) : (
                  <HistoryUnChecked />
                )}
                <span className={styles.optionLabel}>{label}</span>
              </div>
              <span className={styles.optionCount}>
                {optionCounts[label] ?? 0}건
              </span>
            </button>
          );
        })}
      </div>
    </HistoryModal>
  );
}

export default HistoryProofModal;
