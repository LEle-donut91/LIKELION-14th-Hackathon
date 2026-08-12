import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./History.module.css";

// mock 데이터 파일 불러오기
import { mockTransactions } from "../api/history-mock-data.js";
import { mockSearchTransactions } from "../api/history-search-mock-data.js";

import HistoryQualModal from "../components/HistoryQualModal";
import HistoryProofModal from "../components/HistoryProofModal";
import HistoryTypeModal from "../components/HistoryTypeModal";
import Header from "../components/Header";
import Button from "../components/Button";

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
  "기타(비용)": HistoryEtcExpenseIcon,

  // 수입 카테고리 (2개)
  매출: HistorySalesIcon,
  "기타(수입)": HistoryEtcIncomeIcon,
};

// Enum 매핑 객체
const EXPENSE_CATEGORY_MAP = {
  TAXES_AND_DUES: "제세공과금",
  RENT: "임차료",
  BUSINESS_PROMOTION_EXPENSE: "기업업무추진비",
  VEHICLE_MAINTENANCE: "차량유지비",
  SERVICE_FEES: "지급수수료",
  SUPPLIES: "소모품비",
  DELIVERY_EXPENSE: "운반비",
  ADVERTISING_EXPENSE: "광고선전비",
  TRAVEL_AND_TRANSPORTATION: "여비교통비",
  OTHER_EXPENSE: "기타(비용)",
};

const INCOME_CATEGORY_MAP = {
  SALES: "매출",
  OTHER_INCOME: "기타(수입)",
};

const EVIDENCE_TYPE_MAP = {
  TAX_INVOICE: "세금계산서",
  INVOICE: "계산서",
  CARD_RECEIPT: "신용카드 매출전표",
  CASH_RECEIPT: "현금영수증",
  NON_QUALIFIED: "해당 없음",
};

// mockTransactions 데이터를 기존 뷰 포맷으로 변환하는 함수
const transformMockData = (rawList) => {
  return rawList.map((item) => {
    const dateObj = new Date(item.date);
    const year = String(dateObj.getFullYear() || "2026");
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const formattedDate = `${month}월 ${day}일`;

    const category =
      item.type === "EXPENSE"
        ? EXPENSE_CATEGORY_MAP[item.expenseCategory] || ""
        : INCOME_CATEGORY_MAP[item.incomeCategory] || "";

    return {
      id: item.analysisId,
      year: year,
      title: `${item.merchantName} (${item.itemName})`,
      merchantName: item.merchantName,
      itemName: item.itemName,
      date: formattedDate,
      amount: item.amount ? item.amount.toLocaleString() : "0",
      type: item.type === "EXPENSE" ? "expense" : "income",
      isQualified: item.qualifiedEvidence,
      evidenceType: EVIDENCE_TYPE_MAP[item.evidenceType] || "",
      category: category,
    };
  });
};

const RECORD_LIST = transformMockData(mockTransactions);
const SEARCH_RESULTS = transformMockData(mockSearchTransactions);

// 데이터에 존재하는 연도 목록 자동 추출 (내림차순 정렬: ["2026", "2025", "2024", ...])
const AVAILABLE_YEARS = Array.from(
  new Set(RECORD_LIST.map((item) => item.year)),
).sort((a, b) => Number(b) - Number(a));

// 최신 연도 설정 (데이터가 없을 경우 대비)
const LATEST_YEAR = AVAILABLE_YEARS[0] || "기록 없음";

const renderCategoryIcon = (category) => {
  const iconSrc = CATEGORY_ICONS[category];
  if (!iconSrc) return null;
  return <img src={iconSrc} alt={category} />;
};

function History() {
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

  // 내보내기 페이지로 이동하며 현재 활성화된 연도 전달
  const handleExport = () => {
    navigate("/export", {
      state: {
        selectedYear: Number(selectedYear),
      },
    });
  };

  // 검색 아이콘 클릭 또는 엔터 입력 시
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("값을 입력해주세요");
      return;
    }

    setIsSearched(true);
    alert(`${SEARCH_RESULTS.length}건이 검색되었습니다.`);
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
    if (isSearched) return SEARCH_RESULTS;
    return RECORD_LIST.filter((item) => item.year === selectedYear);
  }, [isSearched, SEARCH_RESULTS, selectedYear]);

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
        {AVAILABLE_YEARS.map((year) => (
          <button
            key={year}
            type="button"
            className={`${styles.yearTab} ${selectedYear === year ? styles.activeYear : ""}`}
            onClick={() => {
              setSelectedYear(year);
              setIsSearched(false);
              setSearchTerm("");
            }}
          >
            {year}년
          </button>
        ))}
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
        <Button text="내보내기" onClick={handleExport} />
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

export default History;
