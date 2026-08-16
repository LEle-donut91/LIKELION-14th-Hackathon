import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./History.module.css";
import { historyApi } from "../api/historyApi";

import HistoryQualModal from "../components/HistoryQualModal";
import HistoryProofModal from "../components/HistoryProofModal";
import HistoryTypeModal from "../components/HistoryTypeModal";
import Header from "../components/Header";
import Button from "../components/Button";

import HistoryArrowIcon from "../assets/images/HistoryArrowIcon.svg";
import HistoryDeleteIcon from "../assets/images/HistoryDeleteIcon.svg";
import HistorySearchIcon from "../assets/images/HistorySearchIcon.svg";

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

// API 데이터를 컴포넌트 뷰 포맷으로 변환하는 함수
const transformApiData = (rawList = []) => {
  return rawList.map((item) => {
    const dateObj = new Date(item.date);
    const year = String(dateObj.getFullYear() || "2026");
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const formattedDate = `${month}월 ${day}일`;

    const category =
      item.type === "EXPENSE"
        ? EXPENSE_CATEGORY_MAP[item.category] || ""
        : INCOME_CATEGORY_MAP[item.category] || "";

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

      // 원천 데이터 전체
      raw: item,
    };
  });
};

const renderCategoryIcon = (category) => {
  const iconSrc = CATEGORY_ICONS[category];
  if (!iconSrc) return null;
  return <img src={iconSrc} alt={category} className={styles.categoryImg} />;
};

function History() {
  const navigate = useNavigate();

  // 서버 연동 데이터 상태 management
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [recordList, setRecordList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // 필터 및 모달 상태
  const [activeBottomSheet, setActiveBottomSheet] = useState(null);
  const [qualifiedFilter, setQualifiedFilter] = useState("all");
  const [evidenceFilter, setEvidenceFilter] = useState([]);
  const [categoryType, setCategoryType] = useState("expense");
  const [selectedCategory, setSelectedCategory] = useState([]);

  // 검색용 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  const closeBottomSheet = () => setActiveBottomSheet(null);

  // 초기 연도 목록 조회
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await historyApi.getLedgerYears();
        if (res.status === 200 && res.data?.years) {
          const yearsStr = res.data.years.map(String);
          setAvailableYears(yearsStr);
          if (yearsStr.length > 0) {
            setSelectedYear(yearsStr[0]); // 최신 연도 자동 선택
          }
        }
      } catch (err) {
        console.error("연도 목록 조회 실패:", err);
      }
    };
    fetchYears();
  }, []);

  // 선택된 연도의 전체 데이터 조회
  const fetchLedgerList = useCallback(async () => {
    if (!selectedYear) return;
    try {
      const res = await historyApi.getLedgerList(Number(selectedYear));
      if (res.status === 200 && res.data?.transactions) {
        setRecordList(transformApiData(res.data.transactions));
      }
    } catch (err) {
      console.error("기록 목록 조회 실패:", err);
      setRecordList([]);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (!isSearched) {
      fetchLedgerList();
    }
  }, [selectedYear, isSearched, fetchLedgerList]);

  // 내보내기 페이지로 이동하며 현재 활성화된 연도 전달
  const handleExport = () => {
    navigate("/export", {
      state: {
        selectedYear: Number(selectedYear),
      },
    });
  };

  // 검색 아이콘 클릭 또는 엔터 입력 시
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("값을 입력해주세요");
      return;
    }
    try {
      const res = await historyApi.getLedgerSearch(
        Number(selectedYear),
        searchTerm.trim(),
      );
      if (res.status === 200) {
        const transformed = transformApiData(res.data);
        setSearchResults(transformed);
        setIsSearched(true);
        alert(`${transformed.length}건이 검색되었습니다.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "검색 도중 오류가 발생했습니다.");
    }
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
    return isSearched ? searchResults : recordList;
  }, [isSearched, searchResults, recordList]);

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
    let label = "적격 여부";
    if (qualifiedFilter === "qualified") label = "적격";
    if (qualifiedFilter === "unqualified") label = "부적격";

    const isFiltered = qualifiedFilter !== "all"; // 필터 적용 여부

    return (
      <>
        <span className={styles.chipText}>{label}</span>

        {isFiltered ? (
          /* 1) 필터 적용 시: X 아이콘 */
          <img src={HistoryDeleteIcon} alt="X" />
        ) : (
          /* 2) 필터 미적용 시: 아래 화살표 아이콘 */
          <img src={HistoryArrowIcon} alt="Arrow" />
        )}
      </>
    );
  };

const getEvidenceChipContent = () => {
    const count = evidenceFilter.length;
    const isFiltered = count > 0;
    const isMulti = count >= 2;

    return (
      <>
        <span className={styles.chipText}>
          {/* 0개 선택 시 또는 2개 이상 선택 시 "증빙 유형", 1개 선택 시 선택한 항목 */}
          {count === 1 ? evidenceFilter[0] : "증빙 유형"}
        </span>
        {/* 2개 이상 선택 시에만 숫자 badge 노출 */}
        {isMulti && (
          <div className={styles.chipBadge}>
            <b>{count}</b>
          </div>
        )}
        {isFiltered ? (
          /* 1) 필터 적용 시: X 아이콘 */
          <img src={HistoryDeleteIcon} alt="X" />
        ) : (
          /* 2) 필터 미적용 시: 아래 화살표 아이콘 */
          <img src={HistoryArrowIcon} alt="Arrow" />
        )}
      </>
    );
  };

  const getCategoryChipContent = () => {
    const count = selectedCategory.length;
    const isFiltered = count > 0;
    const isMulti = count >= 2;

    return (
      <>
        <span className={styles.chipText}>
          {/* 0개 선택 시 또는 2개 이상 선택 시 "경비 항목", 1개 선택 시 선택한 항목 */}
          {count === 1 ? selectedCategory[0] : "경비 항목"}
        </span>
        {/* 2개 이상 선택 시에만 숫자 badge 노출 */}
        {isMulti && (
          <div className={styles.chipBadge}>
            <b>{count}</b>
          </div>
        )}
        {isFiltered ? (
          /* 1) 필터 적용 시: X 아이콘 */
          <img src={HistoryDeleteIcon} alt="X" />
        ) : (
          /* 2) 필터 미적용 시: 아래 화살표 아이콘 */
          <img src={HistoryArrowIcon} alt="Arrow" />
        )}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Header text="기록 조회" />
      </div>

      <nav className={styles.yearTabGroup}>
        {availableYears.map((year) => (
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
          >
            <img src={HistorySearchIcon} alt="Search" />
          </span>
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
            // 리스트의 각각의 항목 클릭 시, 상세페이지(EditEx, EditIn)로 이동
            <article
              key={item.id}
              className={styles.recordItem}
              onClick={() => {
                // targetPath는 클릭 후 이동할 경로
                // 현재 클릭한 항목의 ID를 경로 뒤에 붙임 (예: /edit_expense/ana_001)

                // 1) 지출(expense)일 경우, EditEx.jsx로 이동 (예: /edit_expense/ana_001)
                // 2) 수입(income)일 경우, EditIn.jsx로 이동 (예: /edit_income/ana_010)
                const targetPath =
                  item.type === "expense"
                    ? `/edit_expense/${item.id}`
                    : `/edit_income/${item.id}`;
                navigate(targetPath);
              }}
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

                {/* 수입일 때는 빈 <span> 공간을 남겨 높이 정렬을 유지 */}
                {item.type === "expense" &&
                item.isQualified !== null &&
                item.isQualified !== undefined ? (
                  <span
                    className={`${styles.badge} ${
                      item.isQualified
                        ? styles.badgeQualified
                        : styles.badgeUnqualified
                    }`}
                  >
                    {item.isQualified ? "적격" : "부적격"}
                  </span>
                ) : (
                  <span className={styles.badgePlaceholder} />
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
