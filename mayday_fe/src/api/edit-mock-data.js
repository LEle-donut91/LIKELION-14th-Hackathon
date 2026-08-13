// 1. 수입 더미 데이터
export const incomeEditData = {
  analysisId: "ana_080",
  type: "INCOME",
  date: "2026-08-02",
  merchantName: "크몽",
  itemName: "외주 용역비",
  amount: 967000,
  category: "SALES", // "매출" -> SALES
  withholding: true, // 3.3% 원천징수 여부 (true / false)
};

// 2. 지출(경비) 더미 데이터
export const expenseEditData = {
  analysisId: "ana_010",
  type: "EXPENSE",
  date: "2026-08-04",
  merchantName: "쿠팡",
  itemName: "A4 용지 외 2건",
  amount: 34900,
  category: "SUPPLIES", // "소모품비" -> SUPPLIES
  evidenceType: "NON_QUALIFIED", // "해당 없음" -> NON_QUALIFIED
  qualifiedEvidence: false, // "부적격" -> false ("적격"일 경우 true)
};
