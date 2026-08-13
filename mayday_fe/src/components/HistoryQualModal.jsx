/* 적격 여부 필터링하는 모달 (바텀 시트) */
import React, { useState, useEffect, useMemo } from "react";
import HistoryModal from "./HistoryModal";
import styles from "./HistoryModal.module.css";
import HistoryChecked from "./HistoryChecked";

const QUALIFIED_OPTIONS = [
  { id: "all", label: "전체" },
  { id: "qualified", label: "적격" },
  { id: "unqualified", label: "부적격" },
];

function HistoryQualModal({ isOpen, onClose, value, onApply, records = [] }) {
  const [tempSelected, setTempSelected] = useState(value);

  useEffect(() => {
    if (isOpen) setTempSelected(value);
  }, [isOpen, value]);

  // 내부에서 건수 직접 계산
  const optionCounts = useMemo(() => {
    return {
      all: records.length,
      qualified: records.filter((i) => i.isQualified === true).length,
      unqualified: records.filter((i) => i.isQualified === false).length,
    };
  }, [records]);

  // 하단 버튼용 건수
  const tempCount = useMemo(() => {
    return optionCounts[tempSelected] ?? records.length;
  }, [optionCounts, tempSelected, records.length]);

  return (
    <HistoryModal
      isOpen={isOpen}
      onClose={onClose}
      title="적격 여부"
      onReset={() => setTempSelected("all")}
      submitText={`${tempCount}건 보기`}
      onSubmit={() => onApply(tempSelected)}
    >
      <div className={styles.qualOptionsList}>
        {QUALIFIED_OPTIONS.map((opt) => {
          const isSelected = tempSelected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.optionRow} ${isSelected ? styles.selected : ""}`}
              onClick={() => setTempSelected(opt.id)}
            >
              <span className={styles.optionLabel}>{opt.label}</span>
              {isSelected ? (
                <HistoryChecked checked={isSelected} type="circle" />
              ) : (
                <span className={styles.optionCount}>
                  {optionCounts[opt.id] ?? 0}건
                </span>
              )}
            </button>
          );
        })}
      </div>
    </HistoryModal>
  );
}

export default HistoryQualModal;
