/* 경비 항목 필터링하는 모달 (바텀 시트) */
import React, { useState, useEffect, useMemo } from "react";
import HistoryModal from "./HistoryModal";
import styles from "./HistoryModal/HistoryModal.module.css";

const EXPENSE_CATEGORIES = [
  "소모품비",
  "지급수수료",
  "여비교통비",
  "광고선전비",
  "임차료",
  "운반비",
  "기업업무추진비",
  "제세공과금",
  "차량유지비",
  "기타 (비용)",
];

const INCOME_CATEGORIES = ["매출", "기타(수입)"];

function HistoryTypeModal({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  value = [],
  onApply,
  records = [],
}) {
  const [tempCategories, setTempCategories] = useState(value);

  useEffect(() => {
    if (isOpen) {
      setTempCategories(Array.isArray(value) ? value : value ? [value] : []);
    }
  }, [isOpen, value]);

  const currentCategories =
    activeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const toggleCategory = (cat) => {
    setTempCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat],
    );
  };

  // 실시간 선택 조건 기준 보기 건수 계산
  const tempCount = useMemo(() => {
    if (tempCategories.length > 0) {
      return records.filter((i) => tempCategories.includes(i.category)).length;
    }
    return records.filter((i) => i.type === activeTab).length;
  }, [records, activeTab, tempCategories]);

  return (
    <HistoryModal
      isOpen={isOpen}
      onClose={onClose}
      title="항목"
      onReset={() => setTempCategories([])}
      submitText={`${tempCount}건 보기`}
      onSubmit={() => onApply(tempCategories)}
    >
      <div className={styles.sheetContent}>
        <div className={styles.tabContainer}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === "expense" ? styles.activeTab : ""}`}
            onClick={() => {
              onTabChange("expense");
              setTempCategories([]);
            }}
          >
            비용
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === "income" ? styles.activeTab : ""}`}
            onClick={() => {
              onTabChange("income");
              setTempCategories([]);
            }}
          >
            수입
          </button>
        </div>

        <div className={styles.categoryChipGroup}>
          {currentCategories.map((cat) => {
            const isSelected = tempCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryChip} ${isSelected ? styles.selectedCategoryChip : ""}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </HistoryModal>
  );
}

export default HistoryTypeModal;
