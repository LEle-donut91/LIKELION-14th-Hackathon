import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./History.module.css";

import HistoryQualModal from "../components/HistoryQualModal";
import HistoryProofModal from "../components/HistoryProofModal";
import HistoryTypeModal from "../components/HistoryTypeModal";
import Header from "../components/Header";
import Button from "../components/Button"

import HistoryAdIcon from "../assets/images/HistoryAdIcon.svg";
import HistoryBusinessIcon from "../assets/images/HistoryBusinessIcon.svg";
import HistoryCommissionIcon from "../assets/images/HistoryCommissionIcon.svg";
import HistoryDeliveryIcon from "../assets/images/HistoryDeliveryIcon.svg";
import HistoryEtcExpenseIcon from "../assets/images/HistoryEtcExpenseIcon.svg";
import HistoryEtcIncomeIcon from "../assets/images/HistoryEtcIncomeIcon.svg";
import HistoryRentIcon from "../assets/images/HistoryRentIcon.svg";
import HistorySalesIcon from "../assets/images/HistorySalesIcon.svg";
import HistorySuppliesIcon from "../assets/images/HistorySuppliesIcon.svg";
import HistoryTaxIcon from "../assets/images/HistoryTaxIcon.svg";
import HistoryTransportIcon from "../assets/images/HistoryTransportIcon.svg";
import HistoryVehicleIcon from "../assets/images/HistoryVehicleIcon.svg";

// 전체 카테고리 아이콘 매핑 객체
const CATEGORY_ICONS = {
  // 지출 카테고리 (10개)
  소모품비: HistorySuppliesIcon,
  지급수수료: HistoryCommissionIcon,
  여비교통비: HistoryTransportIcon,
  광고선전비: HistoryAdIcon,
  임차료: HistoryRentIcon,
  운반비: HistoryDeliveryIcon,
  기업업무추진비: HistoryBusinessIcon,
  제세공과금: HistoryTaxIcon,
  차량유지비: HistoryVehicleIcon,
  "기타 (비용)": HistoryEtcExpenseIcon,

  // 수입 카테고리 (2개)
  매출: HistorySalesIcon,
  "기타(수입)": HistoryEtcIncomeIcon,
};

const renderCategoryIcon = (category) => {
  const iconSrc = CATEGORY_ICONS[category];
  if (!iconSrc) return null;
  return <img src={iconSrc} alt={category} />;
};

// 더미 데이터 (추후 서버 응답으로 가져올 데이터)
const RECORD_LIST = [
  {
    id: 1,
    year: "2026",
    title: "쿠팡 (사무용품)",
    date: "8월 4일",
    amount: "34,900",
    type: "expense",
    isQualified: true,
    evidenceType: "신용카드 매출전표",
    category: "소모품비",
  },
  {
    id: 2,
    year: "2026",
    title: "스타벅스 (미팅)",
    date: "8월 3일",
    amount: "12,000",
    type: "expense",
    isQualified: true,
    evidenceType: "신용카드 매출전표",
    category: "기업업무추진비",
  },
  {
    id: 3,
    year: "2026",
    title: "한진택배 (발송비)",
    date: "8월 2일",
    amount: "4,500",
    type: "expense",
    isQualified: true,
    evidenceType: "세금계산서",
    category: "운반비",
  },
  {
    id: 4,
    year: "2026",
    title: "OO학원 (강사료)",
    date: "8월 2일",
    amount: "4,500",
    type: "income",
    isQualified: false,
    evidenceType: "세금계산서",
    category: "매출",
  },
  {
    id: 5,
    year: "2026",
    title: "다이소 (포장재)",
    date: "7월 30일",
    amount: "8,000",
    type: "expense",
    isQualified: false,
    evidenceType: "현금영수증",
    category: "소모품비",
  },
  {
    id: 6,
    year: "2025",
    title: "쿠팡 (사무용품)",
    date: "8월 4일",
    amount: "34,900",
    type: "expense",
    isQualified: true,
    evidenceType: "신용카드 매출전표",
    category: "소모품비",
  },
  {
    id: 7,
    year: "2025",
    title: "스타벅스 (미팅)",
    date: "8월 3일",
    amount: "12,000",
    type: "expense",
    isQualified: true,
    evidenceType: "신용카드 매출전표",
    category: "기업업무추진비",
  },
  {
    id: 8,
    year: "2025",
    title: "한진택배 (발송비)",
    date: "8월 2일",
    amount: "4,500",
    type: "expense",
    isQualified: true,
    evidenceType: "계산서",
    category: "운반비",
  },
  {
    id: 9,
    year: "2025",
    title: "OO학원 (강사료)",
    date: "8월 2일",
    amount: "4,500",
    type: "income",
    isQualified: false,
    evidenceType: "세금계산서",
    category: "매출",
  },
  {
    id: 10,
    year: "2025",
    title: "다이소 (포장재)",
    date: "7월 30일",
    amount: "8,000",
    type: "expense",
    isQualified: false,
    evidenceType: "현금영수증",
    category: "소모품비",
  },
];

// 검색 시 반환될 더미 데이터 (서버 연동 전 임시 데이터)
const SEARCH_DUMMY_RESULTS = [
  {
    id: 101,
    year: "2026",
    title: "알파문구",
    date: "8월 10일",
    amount: "15,000",
    type: "expense",
    isQualified: true,
    evidenceType: "신용카드 매출전표",
    category: "소모품비",
  },
  {
    id: 102,
    year: "2026",
    title: "이디야커피",
    date: "8월 8일",
    amount: "8,500",
    type: "expense",
    isQualified: true,
    evidenceType: "현금영수증",
    category: "기업업무추진비",
  },
  {
    id: 103,
    year: "2026",
    title: "카카오T 택시",
    date: "8월 5일",
    amount: "14,200",
    type: "expense",
    isQualified: false,
    evidenceType: "신용카드 매출전표",
    category: "여비교통비",
  },
];

const LATEST_YEAR = String(
  Math.max(...RECORD_LIST.map((item) => Number(item.year))),
);

function RecordHistory() {
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState(LATEST_YEAR);
  const [activeBottomSheet, setActiveBottomSheet] = useState(null);
  const [qualifiedFilter, setQualifiedFilter] = useState("all");
  const [evidenceFilter, setEvidenceFilter] = useState([]);
  const [categoryType, setCategoryType] = useState("expense");
  const [selectedCategory, setSelectedCategory] = useState([]);

  // 검색용 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  const closeBottomSheet = () => setActiveBottomSheet(null);

  const handleItemClick = (type) => {
    if (type === "expense") navigate("/edit_expense");
    else if (type === "income") navigate("/edit_income");
  };

  // 검색 아이콘 클릭 또는 엔터 입력 시
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("값을 입력해주세요");
      return;
    }

    setIsSearched(true);
    alert(`${SEARCH_DUMMY_RESULTS.length}건이 검색되었습니다.`);
  };

  // 검색어 입력 변경 시 (검색어가 비면 다시 전체 데이터 모드로 복귀)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setIsSearched(false);
    }
  };

  // 검색 실행 여부에 따라 표시할 대상 데이터셋 결정
  const targetRecords = useMemo(() => {
    if (isSearched) return SEARCH_DUMMY_RESULTS;
    return RECORD_LIST.filter((item) => item.year === selectedYear);
  }, [isSearched, selectedYear]);

  // 필터링 적용
  const filteredRecords = targetRecords.filter((item) => {
    if (qualifiedFilter === "qualified" && !item.isQualified) return false;
    if (qualifiedFilter === "unqualified" && item.isQualified) return false;
    if (
      evidenceFilter.length > 0 &&
      !evidenceFilter.includes(item.evidenceType)
    )
      return false;
    if (
      selectedCategory.length > 0 &&
      !selectedCategory.includes(item.category)
    )
      return false;
    return true;
  });

  const getQualifiedChipContent = () => {
    if (qualifiedFilter === "qualified") return <>적격</>;
    if (qualifiedFilter === "unqualified") return <>부적격</>;
    return "적격 여부 ▾";
  };

  const getEvidenceChipContent = () => {
    if (evidenceFilter.length === 0) return "증빙 유형 ▾";
    if (evidenceFilter.length === 1) {
      return <>{evidenceFilter[0]}</>;
    }
    return (
      <>
        {evidenceFilter[0]} 외 {evidenceFilter.length - 1}
      </>
    );
  };

  const getCategoryChipContent = () => {
    if (selectedCategory.length === 0) return "경비 항목 ▾";
    if (selectedCategory.length === 1) {
      return <>{selectedCategory[0]}</>;
    }
    return (
      <>
        {selectedCategory[0]} 외 {selectedCategory.length - 1}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusBar} />

      <div className={styles.header}>
        <Header text="기록 조회" />
      </div>

      <nav className={styles.yearTabGroup}>
        <button
          type="button"
          className={`${styles.yearTab} ${selectedYear === "2026" ? styles.activeYear : ""}`}
          onClick={() => {
            setSelectedYear("2026");
            setIsSearched(false); // 연도 변경 시 검색 상태 초기화
            setSearchTerm("");
          }}
        >
          2026년
        </button>
        <button
          type="button"
          className={`${styles.yearTab} ${selectedYear === "2025" ? styles.activeYear : ""}`}
          onClick={() => {
            setSelectedYear("2025");
            setIsSearched(false); // 연도 변경 시 검색 상태 초기화
            setSearchTerm("");
          }}
        >
          2025년
        </button>
      </nav>

      <section className={styles.filterSection}>
        <div className={styles.searchBar}>
          <span
            className={styles.searchIcon}
            onClick={handleSearch}
            style={{ cursor: "pointer" }}
          />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="거래처 · 거래내용 검색"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        <div className={styles.chipGroup}>
          <button
            type="button"
            className={`${styles.chip} ${qualifiedFilter !== "all" ? styles.activeChip : ""}`}
            onClick={() => setActiveBottomSheet("qualified")}
          >
            {getQualifiedChipContent()}
          </button>

          <button
            type="button"
            className={`${styles.chip} ${evidenceFilter.length > 0 ? styles.activeChip : ""}`}
            onClick={() => setActiveBottomSheet("evidence")}
          >
            {getEvidenceChipContent()}
          </button>

          <button
            type="button"
            className={`${styles.chip} ${selectedCategory.length > 0 ? styles.activeChip : ""}`}
            onClick={() => setActiveBottomSheet("expenseCategory")}
          >
            {getCategoryChipContent()}
          </button>
        </div>
      </section>

      <div className={styles.resultSummary}>
        <span>필터 결과 </span>
        <strong className={styles.resultCount}>
          {filteredRecords.length}건
        </strong>
      </div>

      <main className={styles.recordList}>
        {filteredRecords.map((item) => (
          <article
            key={item.id}
            className={styles.recordItem}
            onClick={() => handleItemClick(item.type)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.recordIconWrapper}>
              {renderCategoryIcon(item.category)}
            </div>

            <div className={styles.recordInfo}>
              <span className={styles.recordTitle}>{item.title}</span>
              <span className={styles.recordDesc}>
                {item.date} · {item.category}
              </span>
            </div>
            <div className={styles.recordRight}>
              <strong className={styles.recordAmount}>
                {item.type === "expense"
                  ? `- ${item.amount}원`
                  : `+ ${item.amount}원`}
              </strong>
              {item.isQualified !== null && item.isQualified !== undefined && (
                <span
                  className={`${styles.badge} ${
                    item.isQualified
                      ? styles.badgeQualified
                      : styles.badgeUnqualified
                  }`}
                >
                  {item.isQualified ? "적격" : "부적격"}
                </span>
              )}
            </div>
          </article>
        ))}
      </main>

      <footer className={styles.footer}>
        <Button text="내보내기" onClick={() => navigate("/export")} />
      </footer>

      <HistoryQualModal
        isOpen={activeBottomSheet === "qualified"}
        onClose={closeBottomSheet}
        value={qualifiedFilter}
        onApply={(val) => {
          setQualifiedFilter(val);
          closeBottomSheet();
        }}
        records={targetRecords}
      />

      <HistoryProofModal
        isOpen={activeBottomSheet === "evidence"}
        onClose={closeBottomSheet}
        value={evidenceFilter}
        onApply={(val) => {
          setEvidenceFilter(val);
          closeBottomSheet();
        }}
        records={targetRecords}
      />

      <HistoryTypeModal
        isOpen={activeBottomSheet === "expenseCategory"}
        onClose={closeBottomSheet}
        activeTab={categoryType}
        onTabChange={setCategoryType}
        value={selectedCategory}
        onApply={(val) => {
          setSelectedCategory(val);
          closeBottomSheet();
        }}
        records={targetRecords}
      />
    </div>
  );
}

export default RecordHistory;
